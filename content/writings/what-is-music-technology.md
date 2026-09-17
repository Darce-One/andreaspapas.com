---
title: A Map of Music Technology
date: 2025-10-16
description: An introduction to the tools, themes, and questions that make up music technology.
---

This page outlines the contents presented to university students in a presentation given on 16 October 2025.

## What is Music Technology?

By definition, it refers to all inventions and discoveries within the field of music.

Things we can associate with music technology:

- Musical instruments: flutes, organs, synths...
- Recording equipment: microphones, speakers, mixing desks, DAWs...
- Music distribution: CDs, LPs, MP3, streaming...
- Music understanding: recommender systems, song detection, transcription...
- Music composition: sheet music, composition software, e-readers...

Things that we cannot associate with music technology:

- Human voice
- Human ear
- Our sense of music and groove
- Whisky

This however does not narrow things down too much. For our purposes, we typically mean modern technology.

## Defining the music technologist

By extent, defining the role of a music technologist is very difficult. Nobody is an expert in everything.

Types of music technologists (specialists):

- Instrument makers, luthiers...
- Sound engineers, mix engineers, mastering engineers...
- People who innovate in the way that we make music
- People who innovate in the way that we experience music

## Active themes and topics in Music Technology

Throughout the years, topics in music technology have gone in and out of focus, based on feasibility and marketability. While the topics may change and evolve, the themes of Music Technology are constant:

- Audio i/o: transferring audio between mediums (air, analog, digital)
- Sound synthesis: the process of creating sound
- Sound manipulation: the process of changing sound in some way
- Machine listening: automating the need to listen
- Generative audio: automating music / SFX creation

Each of these themes has many topics within.

## Audio i/o

i/o (or IO) means input–output. i/o is fundamental to music technology, as it deals with the transfer of music from one domain to another. The main three audio domains are ambient air around us, active electric signal (analog), and a digital string of audio samples (WAV, MP3...).

We can transfer between these domains via key inventions:

- Air → microphone → weak electric signal → pre-amplifier → boosted electrical signal → ADC → digital samples
- Digital samples → DAC → weak electric signal → amplifier → boosted electrical signal → speakers → air

### Storage

We can store audio for future use in two key ways: analog and digital. An analog storage device holds audio data in a medium that can directly be converted to an electric signal. A digital storage device holds data that needs to be decoded back from 1s and 0s to an electric signal.

The debate of analog vs digital is entirely subjective, and analog is considered outdated. Digital representations of sound are far more advantageous than analog, so current activity in Audio IO is happening in the digital domain.

Active topics in Audio IO include lowering the noise floor of mics, converters, and speakers; digital audio compression; and reducing bleed in multi-track recordings.

### Topic Deep Dive: Audio Compression

Compression here is different to the audio effect compression. Its main goal is to save space: streaming services can store more audio per disk and send audio faster.

- MP3 and AAC are lossy: they are not sample-perfect reconstructions, but shave off information that we don't hear anyway.
- FLAC is lossless: it reduces file size without sacrificing quality.
- WAV is uncompressed.

Compression can also mean moving to a more efficient representation for the content in question. Stereo audio typically has double the information of mono, but most stereo recordings have overlapping sounds that can be leveraged. At 3D-audio scale, where there may be up to 128 channels, we cannot justify an audio file being 128 times larger. Dolby Atmos and AC-4 directly tackle these problems.

The cutting-edge algorithms leverage machine learning to encode and decode audio into a latent space. They use more computing power and are much more lossy, although the loss is not in the quality domain. They can compress by a factor of 100 (and growing), and can represent a second of audio very efficiently, opening the doors for AI generative music. See Meta's Encodec.

## Audio Synthesis

Audio synthesis refers to the creation of sound. This is the oldest theme in music technology, since the days we invented flutes made out of bones. Sound synthesis is deeply intertwined with instrument design: in ambient air, we create vibrations by moving strings, membranes, and wind. Here, the focus is on analog and digital synthesis.

### Analog Sound Synthesis

When we think of analog synthesis, we typically mean listening directly to the electrical voltage produced by an electrical circuit. Over the years, many different circuits were created for synthesis. Initially, these circuits were encased separately and patched together with patch cables; the Moog Modular is the famous example. Much of that language is still in use today.

- Voltage Controlled Oscillator (VCO): creates the base waveform (sine, triangle, sawtooth, square) at a given frequency.
- Voltage Controlled Filter (VCF): filters frequencies past a target frequency.
- Voltage Controlled Amplifier (VCA): amplifies or attenuates a signal based on incoming voltage.
- ADSR: creates a four-stage envelope on trigger: attack → decay, hold/sustain → release.

### Digital Sound Synthesis

Digital synthesis breaks free of the constraints of the imperfect analog world, leveraging mathematical precision and compute power to create powerful algorithms.

#### Subtractive Synthesis

Start with a harmonically rich waveform (sawtooth, square, triangle, noise), and apply filters to shave off frequencies we do not want.

#### Additive Synthesis

Add the exact frequencies we want together. Applying different shapers to each partial can create fluid sounds.

#### Wavetable Synthesis

Use a repeatable waveform with a predetermined evolution path, played in a fast loop.

#### Frequency Modulation Synthesis

Strange things happen when we modify an oscillator’s frequency at rates comparable to its own oscillation. This powerful engine is at the essence of the Yamaha DX7.

#### Physical Modelling Synthesis

Calculate the movement of physical objects using the laws of physics: for example, the exact movement of strings. It answers questions such as what a 20m-long trumpet blown by a giant might sound like, and can model electrical components for virtual-analog synthesis.

#### Granular and Concatenative Synthesis

Granular synthesis takes a pre-loaded sample and plays little pieces (grains) of it — perhaps many random pieces at the same time and at different starting positions. Concatenative synthesis is similar, but chooses grains from a corpus based on their similarity to a target recording.

#### Neural Synthesis

The newest form of synthesis leverages trained neural networks. Algorithms include DDSP, GANsynth, RAVE, MusicGen, and private algorithms owned by Suno, Udio, and Stable Audio.

## Sound Manipulation

### Audio effects

This theme covers audio effects. Some are utility effects routinely used in mixing and mastering, while others are more creative.

- Routine effects: compressor, limiter, EQ, saturation.
- Creative effects: phasor, delay, reverb, filters, and many more.

The topics in sound manipulation are similar to those in synthesis. We are always looking for creative algorithms to modify sounds in new ways, and the themes blend together. With current research lines in ML, they are practically studied under the same lens. You can use audio effects as a musical instrument — *The Sound of Explosions*.

### Stem Separation

This topic looks at splitting a full mix back into separate stems. It remains an expensive, compute-heavy process performed offline. The state of the art is [Demucs](https://github.com/facebookresearch/demucs), which can split a mix into piano, vocals, drums, bass, and other. Research focuses on speed, efficiency, and expanding the available stems.

## Machine Listening

Machine listening extends beyond music, though much work has happened for musical applications.

### Recommender Systems

Recommender systems use a mix of collaborative filtering and content-based filtering. Collaborative filtering recommends items by matching your habits to habits of other people: people who listened to Ibrahim Maalouf also listened to Ziad Rahbani. Content-based filtering recommends items using calculated similarity metrics between what you interact with and the wider database.

Calculating similarity is a huge topic. In streaming, we may want not the most similar tracks, but tracks in a similar category. Identifying those categories is the interesting part: tempo, rhythm, feel, emotion, spectral content, loudness, dynamic range, and more all become features to extract.

### Audio retrieval

If you have a huge database of sounds, how do you search through it? Sites such as Freesound moved from matching search terms to titles to filtering tags and finding sounds that sound like search matches without necessarily sharing a name. This is the same challenge when a studio has a hard drive full of badly named audio files that need sorting.

Streaming services receive up to 100,000 song uploads per day. Deezer claims 30% are fully AI-generated. They did not sit there and listen to them one by one.

### Music Education and Computer-aided Musicology

Apps increasingly promise to listen to beginners, identify wrong notes, and provide feedback. This is a hard problem to solve well, but denoisers, better microphones, more compute power, and machine learning make it possible to give feedback on intonation, character, and even emotion.

There are three main forms of music data: audio recordings, sheet music, and computer representations such as MIDI and MusicXML. Computer representations let us research music at high scale: common chord progressions, voicings, motifs, and rhythms. This is not only applicable to Western Music. Many solo-oud or violin performances and stems could become data to analyse playing patterns, common maqams and their exact pitch intonations, regional differences, and groove across instruments and cultures.

## Generative Music

For a very long time, composers have toyed with offloading the creative process to other systems. Today it comes in many forms: generative systems, symbolic generation, and audio generation.

### Generative systems

One early example comes from Mozart’s Musical Dice Game: players rolled dice to determine the order of pre-written bars and played the result. Brian Eno experimented with tape-machine loops playing at different rates to generate music that could continue a long time without repeating, as in *Music for Airports*. In synthesizers, sequencer modules create voltage sequences that can be programmed to play melodies; randomisation turns them into huge music machines while the player barely moves a finger.

### Symbolic Generation

The symbolic part refers to generating music symbols: MIDI, sheet music, or anything another system can interpret musically. Google’s 2019 Bach Doodle took an input melody and harmonised it in the style of a Bach chorale. Another example would create jazz lead sheets from an input.

### Audio Generation

This is the area with the most buzz. It is where labels are fighting music technology companies over musicians’ rights. These algorithms allow anybody to create a full song in minutes from a text prompt. The wider scope must be monitored carefully, as harmful content can become increasingly accessible to create and publish with intent to deceive.

Full-song generators are not the only way to create audio. DDSP trains common audio operators for careful timbre transfer; GANsynth creates samples on the fly, enabling interpolation between sounds; and RAVE blurs synthesis, compression, and timbre transfer by compressing a corpus into an embedding used to synthesise new sounds. The hot insider topic is controllability and playability for these models: nobody thinks of music as pure text.
