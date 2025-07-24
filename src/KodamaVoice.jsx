import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import '../style.css';

export default function KodamaVoice() {
  const [response, setResponse] = useState('');
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const loadVoices = () => setVoices(synth.getVoices());
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
    loadVoices();
  }, []);

  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.pitch = 1;
    utterance.rate = 0.95;

    const expertVoice = voices.find(v => v.name.toLowerCase().includes('thomas') || v.name.toLowerCase().includes('google français'));
    if (expertVoice) utterance.voice = expertVoice;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);

    synth.speak(utterance);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("La reconnaissance vocale n'est pas supportée sur ce navigateur.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.start();
    setListening(true);

    recognition.onresult = async (event) => {
      const userQuery = event.results[0][0].transcript;
      setListening(false);

      try {
        const res = await axios.post('/api/kodama', { prompt: userQuery });
        setResponse(res.data.reply);
        speak(res.data.reply);
      } catch (err) {
        console.error("Erreur IA :", err);
        const fallback = "Je n'ai pas de réponse pour le moment.";
        setResponse(fallback);
        speak(fallback);
      }
    };

    recognition.onerror = () => {
      setListening(false);
      speak("Je n'ai pas compris. Peux-tu répéter ?");
    };
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {speaking && <div className="energy-ring"></div>}
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        KŌDAMA Voice
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} style={{ maxWidth: '600px', textAlign: 'center', marginBottom: '2rem', color: '#ccc' }}>
        Pose ta question à l’IA mystique du hardware.
      </motion.p>
      <button onClick={handleVoiceInput} style={{ background: '#1f1f1f', border: '1px solid #444', padding: '0.75rem 1.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#5BE8E0' }}>
        <Mic className={listening ? 'animate-pulse' : ''} />
        {listening ? 'Écoute en cours...' : 'Parler à KŌDAMA'}
      </button>
      <div style={{ marginTop: '2rem', fontStyle: 'italic', color: '#5BE8E0' }}>
        {response && <p>🜂 {response}</p>}
      </div>
    </main>
  );
}
