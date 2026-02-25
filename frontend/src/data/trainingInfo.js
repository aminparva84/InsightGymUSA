/**
 * Training level and corrective-movements content (matches Excel export).
 * Used as fallback when API returns empty and for landing page "website info".
 * English only.
 */
export const TRAINING_LEVELS_FALLBACK = {
  beginner: {
    label_en: 'Beginner',
    description_en: 'Beginner user: 0–6 months training history; low control over movement form; little familiarity with breathing and mind–muscle coordination; fast recovery but injury-sensitive. Main goals: learn correct form, activate muscles, increase body awareness, build training habit, prevent injury. Design: choose simple, safe, controllable exercises; focus on form, breathing, correct range of motion. General program: 2–4 sessions/week; simple compound movements, machine or bodyweight; 2–3 sets, 10–15 reps; 60–90 sec rest; no advanced techniques (superset, drop set). Breathing & mindfulness: breathing cue per movement; inhale on negative phase, exhale on positive; short pause for body awareness.',
    goals: [
      { en: 'Learn correct movement form' },
      { en: 'Activate muscles' },
      { en: 'Increase body awareness' },
      { en: 'Build training habit' },
      { en: 'Prevent injury' },
    ],
  },
  intermediate: {
    label_en: 'Intermediate',
    description_en: 'Intermediate user: 6 months–2 years training; relative familiarity with form; ability to maintain focus; tolerance for volume; ready for variety. Main goals: increase relative strength, muscle shaping, improve nerve–muscle coordination, introduce training variety. Design: increase intensity, add movement variety, take body out of adaptation. General program: 3–5 sessions/week; bodybuilding + functional; 3–4 sets, 8–12 reps; 45–75 sec rest; limited use of superset, compound sets. Breathing & focus: mind–muscle connection, movement rhythm control, breathing in sync with effort.',
    goals: [
      { en: 'Increase relative strength' },
      { en: 'Muscle shaping' },
      { en: 'Improve nerve–muscle coordination' },
      { en: 'Introduce training variety' },
    ],
  },
  advanced: {
    label_en: 'Advanced',
    description_en: 'Advanced user: over 2 years training; high mastery of form; high physical and mental readiness; high volume tolerance; breathing control; strong mind–muscle connection. Main goals: targeted hypertrophy or strength, advanced fat loss, neuromuscular challenge, performance improvement. Design: fully personalize training; use advanced techniques; intelligently manage intensity, volume, recovery. Program: 4–6 sessions/week; professional mix of bodybuilding, functional, neural training; variable sets/reps (6–15); rest 30–60 sec or variable; techniques: superset, drop set, time under tension, metabolic training. Breathing & mindfulness: breathing control under load; deep focus on body energy; mindful training.',
    goals: [
      { en: 'Targeted hypertrophy or strength' },
      { en: 'Advanced fat loss' },
      { en: 'Neuromuscular challenge' },
      { en: 'Performance improvement' },
    ],
  },
};

const INJURY_KEYS_ORDER = ['knee', 'shoulder', 'lower_back', 'neck', 'wrist', 'ankle'];

export const INJURIES_FALLBACK = {
  knee: {
    label_en: 'Knee',
    purposes_en: 'Main goals during knee injury: 1. Reduce direct pressure on the knee joint. 2. Prevent further injury or worsening pain. 3. Strengthen supporting muscles (quadriceps, hamstrings, glutes). 4. Maintain safe range of motion. 5. Maintain body control and correct movement form.',
    allowed_movements: [
      { en: 'Glute Bridge → strengthen glutes and hamstrings without knee load' },
      { en: 'Hip Thrust → same as Glute Bridge, load on glutes' },
      { en: 'Hamstring Curl (machine or ball) → strengthen posterior thigh without front knee pressure' },
      { en: 'Step-back Lunge or short Reverse Lunge → limited range' },
      { en: 'Short Wall Sit → stability without heavy load' },
      { en: 'Light Leg Press with limited ROM → if machine is adjustable' },
      { en: 'Isometric quad exercises → e.g. Quad Set' },
    ],
    forbidden_movements: [
      { en: 'Deep or fast Squat (Deep Squat)' },
      { en: 'Jump Squat / Plyometric / severe jumping' },
      { en: 'Long forward Lunge' },
      { en: 'Heavy Leg Extension' },
      { en: 'Rapid or sudden direction change' },
      { en: 'Explosive and high-speed movements' },
    ],
    important_notes_en: '1. If pain is moderate or severe → light leg work or substitute. 2. If user has multiple injuries → knee limitation takes priority. 3. Focus on movement control and breathing (calm inhale, exhale on effort phase). 4. Recovery time between sets should be slightly longer than usual. 5. In workout text state: "If pain worsens, stop the exercise and choose a substitute movement."',
  },
  shoulder: {
    label_en: 'Shoulder',
    purposes_en: 'Main goals in shoulder injury: 1. Maintain scapular stability. 2. Avoid pressure on rotator cuff. 3. Strengthen shoulder stabilizers.',
    allowed_movements: [
      { en: 'Seated Row' },
      { en: 'Lat Pulldown (front)' },
      { en: 'Face Pull' },
      { en: 'Light Lateral Raise' },
      { en: 'External Rotation' },
      { en: 'Scapular control exercises' },
    ],
    forbidden_movements: [
      { en: 'Heavy Overhead Press' },
      { en: 'Upright Row' },
      { en: 'Dips' },
      { en: 'Behind-neck Pull-up' },
      { en: 'Heavy Bench Press' },
      { en: 'Explosive overhead movements' },
    ],
    important_notes_en: 'Limited range of motion. Focus on scapular stability. Exhale on effort, inhale on return.',
  },
  lower_back: {
    label_en: 'Lower back',
    purposes_en: 'Main goals during lower back injury: 1. Reduce axial load. 2. Increase core stability. 3. Prevent worsening pain.',
    allowed_movements: [
      { en: 'Bird Dog' },
      { en: 'Dead Bug' },
      { en: 'Glute Bridge' },
      { en: 'Light Hip Hinge' },
      { en: 'Modified Plank' },
      { en: 'Light Cable Pull-through' },
    ],
    forbidden_movements: [
      { en: 'Heavy Deadlift' },
      { en: 'Good Morning' },
      { en: 'Back Squat' },
      { en: 'Russian Twist' },
      { en: 'Hyperextension' },
      { en: 'Sudden rotational movements' },
    ],
    important_notes_en: 'Controlled breathing. Slow movement, precise form. Focus on core muscles.',
  },
  neck: {
    label_en: 'Neck',
    purposes_en: 'Main goals: 1. Remove tension. 2. Maintain neutral spine. 3. Avoid direct pressure.',
    allowed_movements: [
      { en: 'Chin Tuck' },
      { en: 'Isometric neck exercises' },
      { en: 'Upper-body work with neutral neck' },
      { en: 'Light breathing exercises' },
    ],
    forbidden_movements: [
      { en: 'Heavy Shrug' },
      { en: 'Explosive movements' },
      { en: 'Direct pressure on head' },
      { en: 'Rapid neck rotation' },
    ],
    important_notes_en: 'Full neck control. Breathing in sync with movement. If pain → substitute movement.',
  },
  wrist: {
    label_en: 'Wrist',
    purposes_en: 'Main goals: 1. Reduce wrist flexion/extension load. 2. Maintain safe movement. 3. Strengthen forearm and prevent pain.',
    allowed_movements: [
      { en: 'Dumbbell Neutral Grip Press' },
      { en: 'Cable Push / Pull' },
      { en: 'Resistance Band Exercises' },
      { en: 'Light forearm exercises' },
      { en: 'Exercises without weight on hands' },
    ],
    forbidden_movements: [
      { en: 'Classic Push-up' },
      { en: 'Plank on hands' },
      { en: 'Barbell Press' },
      { en: 'Heavy Hanging' },
      { en: 'Burpee' },
    ],
    important_notes_en: 'Limited range of motion. Use neutral grip. Control breathing under load.',
  },
  ankle: {
    label_en: 'Ankle',
    purposes_en: 'Main goals: 1. Joint stability and control. 2. Prevent sprain or direct pressure.',
    allowed_movements: [
      { en: 'Seated Calf Raise' },
      { en: 'Glute-focused movements' },
      { en: 'Short Step-up' },
      { en: 'Simple balance exercises' },
      { en: 'Controlled stretching' },
    ],
    forbidden_movements: [
      { en: 'Jumping / Plyometric' },
      { en: 'High-intensity Running' },
      { en: 'Box Jump' },
      { en: 'Rapid direction change' },
      { en: 'Explosive single-leg exercises' },
    ],
    important_notes_en: 'Control range of motion. Focus on form and balance. Use calm inhale and exhale.',
  },
};

export const COMMON_INJURY_NOTE_FALLBACK = {
  en: 'Common note for all injuries: Always correct form + controlled breathing. If pain is severe → stop the movement and substitute. Safety first, then performance. Remove direct load on the injured joint. Substitute the movement, not remove the whole workout. Focus on: safe range of motion, control, breathing.',
};

export const INJURY_KEYS_ORDER_LIST = INJURY_KEYS_ORDER;
