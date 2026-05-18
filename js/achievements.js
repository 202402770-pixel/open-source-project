const ACHIEVEMENT_IDS = {
  FIRST_WORD: 1,
  COMBO_10: 2,
  COMBO_50: 3,
  HONOR_STUDENT: 4,
  GRADUATION: 5,
  SPEED_RUNNER: 6,
  ATTENDANCE: 7,
  BOSS_HUNTER: 8,
  PERFECTIONIST: 9,
  NIGHT_STUDY: 10,
  SELF_STUDY: 11,
  TOP_CLASS: 12
};

const Achievements = {
  CHALLENGES: [
    { id: ACHIEVEMENT_IDS.FIRST_WORD, title: "첫 받아적기", description: "단어 1개 처리", icon: "✏️", targetValue: 1, isCompleted: false },
    { id: ACHIEVEMENT_IDS.COMBO_10, title: "집중력", description: "콤보 10 달성", icon: "x10", targetValue: 10, isCompleted: false },
    { id: ACHIEVEMENT_IDS.COMBO_50, title: "집중력 폭발", description: "콤보 50 달성", icon: "x50", targetValue: 50, isCompleted: false },
    { id: ACHIEVEMENT_IDS.HONOR_STUDENT, title: "우등생", description: "A+ 학점", icon: "A+", targetValue: 1, isCompleted: false },
    { id: ACHIEVEMENT_IDS.GRADUATION, title: "졸업", description: "LV 15 도달", icon: "🎓", targetValue: 15, isCompleted: false },
    { id: ACHIEVEMENT_IDS.SPEED_RUNNER, title: "속전속결", description: "WPM 100 돌파", icon: "⚡", targetValue: 100, isCompleted: false },
    { id: ACHIEVEMENT_IDS.ATTENDANCE, title: "개근", description: "7일 연속 Daily", icon: "📅", targetValue: 7, isCompleted: false },
    { id: ACHIEVEMENT_IDS.BOSS_HUNTER, title: "보스 헌터", description: "보스 단어 50", icon: "👹", targetValue: 50, isCompleted: false },
    { id: ACHIEVEMENT_IDS.PERFECTIONIST, title: "완벽주의", description: "오타 0%로 한 라운드", icon: "💯", targetValue: 1, isCompleted: false },
    { id: ACHIEVEMENT_IDS.NIGHT_STUDY, title: "야간 자율학습", description: "Zen 3분 완주", icon: "🌙", targetValue: 1, isCompleted: false },
    { id: ACHIEVEMENT_IDS.SELF_STUDY, title: "독학", description: "Custom Words 사용", icon: "📖", targetValue: 1, isCompleted: false },
    { id: ACHIEVEMENT_IDS.TOP_CLASS, title: "수석", description: "리더보드 1위", icon: "🏆", targetValue: 1, isCompleted: false }
    ],

    init() {
        try {
            const saved = JSON.parse(localStorage.getItem('typing_achievements'));
            if (saved && Array.isArray(saved)) {
                this.CHALLENGES.forEach(challenge => {
                  if (saved.includes(challenge.id)) {
                    challenge.isCompleted = true;
                  }
                });
              }
        } catch (e) {
          console.warn("업적 데이터를 불러오지 못했습니다.", e);
        }
    },

    check(id, currentValue) {
        const target = this.CHALLENGES.find(c => c.id === id);
        if (!target || target.isCompleted) return;
        if (currentValue >= target.targetValue) {
            this.complete(target);
        }
    },

    complete(target) {
        target.isCompleted = true;
        this.save();
        UI.showToast(target.title, target.description, target.icon);
    },

    save() {
        try {
            const completed = this.CHALLENGES
              .filter(c => c.isCompleted)
              .map(c => c.id);
            localStorage.setItem('typing_achievements', JSON.stringify(completed));
        } catch (e) {
            console.error("업적 데이터를 저장하지 못했습니다.", e);
        }
    },

    checkAttendance() {
        try {
            const today = new Date();
            const todayStr = today.toDateString();
            let lastDateStr = localStorage.getItem('typing_last_date');
            let attendanceDays = parseInt(localStorage.getItem('typing_attendance_days')) || 0;
            if (lastDateStr !== todayStr) {
                let yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (lastDateStr === yesterday.toDateString()) {
                    attendanceDays++;
                } else {
                    attendanceDays = 1;
                }

                localStorage.setItem('typing_last_date', todayStr);
                localStorage.setItem('typing_attendance_days', attendanceDays);
            }
            this.check(ACHIEVEMENT_IDS.ATTENDANCE, attendanceDays);
        } catch (e) {
            console.warn("출석 데이터를 처리하지 못했습니다.", e);
        }
    }
};
