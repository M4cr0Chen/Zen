# Test Inputs for LangGraph Agent System

Quick reference for testing different agent routing and mentor selection scenarios.

## 🧘 Mindfulness Agent (Emotional Support)

These trigger the empathetic Mindfulness Agent:

```
I'm feeling really anxious and overwhelmed right now
I feel so lonely and disconnected from everyone
I'm crying and don't know why I'm so sad
I'm frustrated and angry at myself for failing again
I feel stressed about everything and can't calm down
I'm upset and hurt by what happened
I feel scared and don't know what to do
```

**Expected:** Routes to Mindfulness Agent, warm validating response

---

## 💪 Stoic Mentors (Marcus Aurelius, Seneca, Epictetus)

Keywords: stress, control, anxiety, worry, acceptance, fear, overwhelmed, pressure

```
I'm stressed about things I can't control at work
I feel overwhelmed by external pressures and expectations
How do I accept things I cannot change?
I'm anxious about the future and what might go wrong
I need help managing my anger and rage
I worry too much about what others think
```

**Expected:** Routes to Wise Mentor → Marcus Aurelius or Seneca

---

## 🧘‍♂️ Mindfulness Teachers (Thich Nhat Hanh, Dalai Lama, Buddha)

Keywords: peace, mindfulness, present, compassion, suffering, meditation, calm, breathe

```
How can I be more present in the moment?
I want to practice more compassion for myself
I'm suffering from attachment to outcomes
How do I find inner peace?
I need help with meditation and mindfulness
I want to let go of my desires
```

**Expected:** Routes to Thich Nhat Hanh, Dalai Lama, or Buddha

---

## 💔 Vulnerability & Shame (Brené Brown)

Keywords: vulnerable, shame, ashamed, brave, courage, belong, worthy, enough

```
I feel so much shame about my past mistakes
I'm afraid to be vulnerable with people
I don't feel like I'm enough or worthy of love
How do I find the courage to be authentic?
I'm scared people will judge me if I share my truth
I struggle with feeling like I don't belong
```

**Expected:** Routes to Brené Brown

---

## 🎯 Purpose & Meaning (Viktor Frankl)

Keywords: meaning, meaningless, suffering, purpose, hopeless, point, why

```
My life feels meaningless and I don't know why I'm here
I'm suffering and can't find any purpose in it
What's the point of all this struggle?
How do I find meaning in my work?
I feel hopeless about the future
Why am I even alive?
```

**Expected:** Routes to Viktor Frankl

---

## 🌊 Flow & Adaptation (Bruce Lee, Laozi)

Keywords: flow, natural, simple, force, pushing, effortless, balance, adapt, water

```
I need to learn to adapt to changing circumstances
Everything feels forced and I'm pushing too hard
How can I be more like water and flow?
I feel stuck in rigid thinking patterns
I want to find the natural way forward
Be water, my friend - what does that mean?
```

**Expected:** Routes to Bruce Lee or Laozi

---

## 🎨 Creative Expression (Frida Kahlo, Vincent van Gogh)

Keywords: pain, body, identity, authentic, art, express, artist, beauty, passion, misunderstood

```
I want to transform my pain into something beautiful
How do I stay authentic in my creative work?
I feel misunderstood as an artist
I struggle with expressing my true self
My passion for art consumes me but also sustains me
I see beauty in things others don't understand
```

**Expected:** Routes to Frida Kahlo or Vincent van Gogh

---

## 💡 Innovation & Vision (Steve Jobs, Albert Einstein)

Keywords: creative, imagination, curiosity, problem, solution, think, different, innovation, vision

```
I have a vision but don't know how to make it real
How do I simplify my complex ideas?
I want to create something that makes a dent in the universe
I'm curious about everything and want to keep learning
How do I think differently from everyone else?
Stay hungry, stay foolish - help me understand
```

**Expected:** Routes to Steve Jobs or Albert Einstein

---

## 🦅 Courage & Resilience (Maya Angelou, Eleanor Roosevelt)

Keywords: strong, strength, rise, overcome, identity, worth, dignity, afraid, courage, inferior

```
I need strength to overcome this difficult time
How do I rise above my circumstances?
I'm afraid but want to find courage
How do I maintain my dignity when others put me down?
I feel inferior and need to build confidence
Still I rise - how do I embody that?
```

**Expected:** Routes to Maya Angelou or Eleanor Roosevelt

---

## ❤️ Love & Spirituality (Rumi, Mother Teresa)

Keywords: love, heart, soul, transform, longing, divine, spiritual, serve, help, compassion

```
My heart feels broken and I'm longing for connection
How do I transform my wounds into light?
I want to serve others but feel small and limited
How can I love myself and others more deeply?
I'm searching for divine connection
The wound is where the light enters - what does this mean?
```

**Expected:** Routes to Rumi or Mother Teresa

---

## ⚔️ Strategy & Mastery (Sun Tzu, Miyamoto Musashi)

Keywords: enemy, conflict, strategy, battle, master, focus, discipline, practice, path, way

```
I'm in conflict with someone and need strategy
How do I master my craft through discipline?
I need to understand myself and my competition better
What's the path to true mastery?
How do I win without fighting?
Know yourself and know your enemy - teach me
```

**Expected:** Routes to Sun Tzu or Miyamoto Musashi

---

## 🌟 Hero's Journey (Joseph Campbell)

Keywords: journey, hero, adventure, bliss, calling, path, myth

```
I feel called to an adventure but I'm scared
What's my hero's journey?
How do I follow my bliss?
The cave I fear to enter might hold treasure
I'm at a crossroads and don't know which path to take
```

**Expected:** Routes to Joseph Campbell

---

## 🔍 Self-Examination (Socrates)

Keywords: confused, understand, truth, meaning, purpose, question, think

```
I'm confused about what I really believe
How do I find truth and meaning?
I have so many questions about life
Help me examine my beliefs more deeply
I realize I know nothing
The unexamined life - what does that mean?
```

**Expected:** Routes to Socrates

---

## ⚖️ Justice & Fairness (Plato, MLK Jr., Nelson Mandela)

Keywords: injustice, unfair, justice, equality, dream, hope, forgive, persevere

```
I'm facing injustice and don't know how to respond
How do I fight for what's right?
I want to create change but feel powerless
How do I forgive those who wronged me?
I dream of a more just world
I have a dream - help me make it real
```

**Expected:** Routes to MLK Jr., Nelson Mandela, or Plato

---

## 🎭 Identity & Shadow Work (Carl Jung, Simone de Beauvoir)

Keywords: dream, shadow, unconscious, personality, identity, self, freedom, choice, become

```
Who am I really? I feel like I'm playing a role
I need to integrate my shadow self
How do I become who I'm meant to be?
I'm exploring my unconscious patterns
What does it mean to be authentic?
Until you make the unconscious conscious...
```

**Expected:** Routes to Carl Jung or Simone de Beauvoir

---

## 🔧 Edge Cases

### Very Short (Should trigger Discovery Agent)
```
Hey
Help
I'm stuck
What do I do?
```

### Very Long (Should skip Discovery)
```
I've been struggling with my career for the past five years and I don't know what to do anymore. I feel like I'm living someone else's life and not being authentic to who I really am. I've tried so many things - therapy, meditation, career coaching - but nothing seems to help me find clarity. What should I do?
```

### Multiple Keywords (Tests which mentor wins)
```
I'm feeling stressed about my creative work and need to adapt my strategy to overcome barriers while finding meaning
```
*Could match: Stoics (stress), Artists (creative), Bruce Lee (adapt), Sun Tzu (strategy), Viktor Frankl (meaning)*

---

## 🔄 Conversation Flows

### Discovery → Mentor Flow
```
Turn 1: I'm struggling with something
Turn 2: It's about my career and feeling stuck
Turn 3: I feel like I'm not living authentically
```

### Emotional → Advice Flow
```
Turn 1: I'm feeling so sad and overwhelmed
Turn 2: Thank you, that helps. Now I need guidance on what to do
```

### Multi-turn with Same Mentor
```
Turn 1: I need to accept what I cannot control
Turn 2: How do I practice that daily?
Turn 3: What about when emotions overwhelm me?
```

---

## 🧪 How to Test

### Option 1: Run Full Test Suite
```bash
cd backend
source venv/bin/activate
python test_agents.py
```

### Option 2: Interactive Mode
```bash
python test_agents.py interactive
```

### Option 3: Via API (Frontend)
1. Start backend: `python -m app.main`
2. Start frontend: `npm run dev`
3. Go to `/counsel` page
4. Type any message from above

### Option 4: Direct API Call
```bash
curl -X POST http://localhost:8000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "I feel so anxious and overwhelmed"}'
```

---

## 📊 Expected Routing Logic

1. **Has emotional keywords?** → Mindfulness Agent
2. **Short message (<150 chars) + early in conversation?** → Discovery Agent
3. **Long message OR extended conversation?** → Skip Discovery, go to Wise Mentor
4. **Wise Mentor:** Match keywords to select from 50+ historical figures

---

## 💡 Pro Tips

- **Test emotional keywords first** - easiest to verify routing
- **Try mentor-specific keywords** - see if matching works
- **Test edge cases** - very short/long messages
- **Multi-turn conversations** - verify state persistence
- **Check backend logs** - see routing decisions in real-time

Happy testing! 🎉
