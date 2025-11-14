// generatesound.js - Quadrant sound systems with Gibberish

(() => {
  Gibberish.workletPath = 'https://unpkg.com/gibberish-dsp/dist/gibberish_worklet.js';
  let ready = false;
  
  // Q1: Monosynth/FM - sustained notes changing with year positions
  let q1Synth, q1LastYear = null;
  let isQ1Playing = false;
  
  // Q2: Soft melody sequencer
  let q2Synth, q2Seq;
  let isQ2Playing = false;
  
  // Q3: PolyFM with reverb and chorus (cups)
  let q3Fm, q3Verb, q3Chorus, q3LastYear = null;
  let isQ3Playing = false;
  
  // Q4: Kick drum with sequencer - rhythmic (clubs)
  let q4Kick, q4Seq;
  let isQ4Playing = false;

  const yearFreqs = {
    1100: 55,
    1200: 73.42,
    1300: 110,
    1400: 146.83,
    1500: 220,
    1600: 293.66,
    1700: 440
  };

  async function initSound() {
    if (ready) return;
    try {
      if (typeof userStartAudio === 'function') await userStartAudio();
      await Gibberish.init();
      Gibberish.export(window);
      ready = true;
      console.log('🎵 Gibberish ready');
    } catch (e) {
      console.error('Audio init failed:', e);
    }
  }

  // Export initSound so it can be called programmatically
  window.initSound = initSound;

  window.addEventListener('pointerdown', initSound, { once: true });

  // ============ Q1: MONOSYNTH - Sustained notes changing with years ============
  window.playQ1 = function() {
    console.log('playQ1() called');
    if (!ready || isQ1Playing) return;
    q1Synth = Monosynth({ gain: .8, attack: 44, decay: 44100 }).connect();
    q1Synth.note(110);
    isQ1Playing = true;
  };

  window.updateQ1Note = function(year) {
    if (!ready || !isQ1Playing || !q1Synth) return;
    if (q1LastYear !== year && yearFreqs[year]) {
      q1Synth.note(yearFreqs[year]);
      q1LastYear = year;
    }
  };

  window.stopQ1 = function() {
    if (q1Synth && isQ1Playing) {
      q1Synth.disconnect();
      q1Synth = null;
      isQ1Playing = false;
      q1LastYear = null;
    }
  };

  window.isQ1Playing = () => isQ1Playing;

  // ============ Q2: SOFT MELODY SEQUENCER ============
  window.playQ2 = function() {
    console.log('playQ2() called');
    if (!ready || isQ2Playing) return;
    
    // Use FM for a softer, different timbre
    q2Synth = FM({ 
      gain: .8,  // Louder
      attack: 220,
      decay: 8820,
      cmRatio: 2.01,
      index: 1,
      carrierWaveform: 'sine',
      modulatorWaveform: 'triangle'
    }).connect();

    q2Seq = Sequencer({
      target: q2Synth,
      key: 'note',
      values: [220, 264, 330, 392],  // Will be updated by distance
      timings: [12050]
    }).start();
    
    isQ2Playing = true;
  };

  window.updateQ2Melody = function(year) {
    if (!ready || !isQ2Playing || !q2Seq) return;
    
    // Change melody based on year (distance from center)
    const melodies = {
      1100: [110, 132, 165, 196],  // Innermost - lower tones
      1200: [147, 176, 220, 262],
      1300: [165, 198, 247, 294],
      1400: [220, 264, 330, 392],  // Middle
      1500: [262, 314, 392, 466],
      1600: [330, 396, 495, 588],
      1700: [440, 528, 660, 784]   // Outermost - higher tones
    };
    
    if (melodies[year]) {
      q2Seq.values = melodies[year];
    }
  };

  window.fadeOutQ2 = function(duration = 600) {
    if (!q2Synth || !isQ2Playing) return;
    console.log('fadeOutQ2() called');
    
    // Stop sequencer immediately to prevent new notes
    if (q2Seq) q2Seq.stop();
    
    const startGain = q2Synth.gain;
    const startTime = Date.now();
    const synth = q2Synth;
    
    const fadeInterval = setInterval(() => {
      if (!synth) {
        clearInterval(fadeInterval);
        return;
      }
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      synth.gain = startGain * (1 - progress);
      
      if (progress >= 1) {
        clearInterval(fadeInterval);
        synth.disconnect();
        isQ2Playing = false;
        q2Synth = null;
        q2Seq = null;
      }
    }, 50);
  };

  window.stopQ2 = function() {
    console.log('stopQ2() called');
    if (q2Seq) q2Seq.stop();
    if (q2Synth) q2Synth.disconnect();
    q2Synth = null;
    q2Seq = null;
    isQ2Playing = false;
  };

  window.isQ2Playing = () => isQ2Playing;

  // ============ Q3: PolyFM with Reverb & Chorus - Long sustain chord (cups) ============
  window.playQ3 = function() {
    console.log('playQ3() called');
    if (!ready || isQ3Playing) return;
    
    // Create effects chain: PolyFM -> Chorus -> Freeverb -> output
    q3Verb = Freeverb({ 
      roomSize: .95, 
      damping: .15 
    }).connect();
    
    q3Chorus = Chorus().connect(q3Verb);
    
    q3Fm = PolyFM({ 
      gain: .8,
      cmRatio: 1.01,
      index: 1.2,
      carrierWaveform: 'triangle',
      modulatorWaveform: 'square',
      attack: 44100 * 32,
      decay: 44100 * 32,
      feedback: .1,
    }).connect(q3Chorus);

    // Play chord
    q3Fm.chord([110, 220, 330, 440]);
    isQ3Playing = true;
  };

  window.updateQ3Note = function(year) {
    // Q3 stays constant - no year-based changes
  };

  window.fadeOutQ3 = function(duration = 800) {
    // Not used - instant cut instead
  };

  window.stopQ3 = function() {
    console.log('stopQ3() called');
    if (q3Fm) q3Fm.disconnect();
    if (q3Chorus) q3Chorus.disconnect();
    if (q3Verb) q3Verb.disconnect();
    q3Fm = null;
    q3Verb = null;
    q3Chorus = null;
    isQ3Playing = false;
    q3LastYear = null;
  };

  window.isQ3Playing = () => isQ3Playing;

  // ============ Q4: KICK DRUM + SEQUENCER - Rhythmic (clubs) ============
  window.playQ4 = function() {
    console.log('playQ4() called');
    if (!ready || isQ4Playing) return;
    
    q4Kick = Kick({ gain: .8 }).connect();
    q4Seq = Sequencer({ 
      target: q4Kick, 
      key: 'note', 
      values: [120], 
      timings: [22050] 
    }).start();
    
    isQ4Playing = true;
  };

  window.updateQ4Sequence = function(values, timings) {
    if (!ready || !isQ4Playing || !q4Seq) return;
    if (values) q4Seq.values = values;
    if (timings) q4Seq.timings = timings;
  };

  window.modulateQ4ByCircles = function(year) {
    if (!ready || !isQ4Playing || !q4Seq) return;
    // Modulate sequence based on year position
    const yearIndex = [1100, 1200, 1300, 1400, 1500, 1600, 1700].indexOf(year);
    if (yearIndex !== -1) {
      // Add more frequencies as we go further out
      const freqs = [120];
      for (let i = 0; i <= yearIndex; i++) {
        freqs.push(120 * (i + 1));
      }
      q4Seq.values = freqs;
      // Get faster as we go out
      q4Seq.timings = [22050 / (yearIndex + 1)];
    }
  };

  window.stopQ4 = function() {
    console.log('stopQ4() called');
    if (q4Seq) q4Seq.stop();
    if (q4Kick) q4Kick.disconnect();
    q4Kick = null;
    q4Seq = null;
    isQ4Playing = false;
  };

  window.isQ4Playing = () => isQ4Playing;

  // Helper to get year from position
  window.getYearFromFingerPos = function(fingerPos) {
    const cx = width / 2;
    const cy = height / 2;
    const radius = (height * 4 / 5) / 2;
    
    const dx = fingerPos.x - cx;
    const dy = fingerPos.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    const years = [1100, 1200, 1300, 1400, 1500, 1600, 1700];
    const ringCount = years.length;
    const minRadius = radius * 0.1;
    const maxRadius = radius * 0.9;
    
    let closestYear = null;
    let minDiff = Infinity;
    
    for (let i = 0; i < ringCount; i++) {
      const r = minRadius + (maxRadius - minRadius) * i / (ringCount - 1);
      const diff = Math.abs(dist - r);
      
      if (diff < minDiff && diff < 30) {
        minDiff = diff;
        closestYear = years[i];
      }
    }
    
    return closestYear;
  };
})();
