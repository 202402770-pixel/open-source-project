import { UI } from './ui.js';

export const challenges = [
  {
    id: 1,
    title: "시작이 반이다",
    description: "게임을 최초로 시작하고 첫 단어를 성공적으로 방어",
    icon: "ST",
    targetValue: 1,
    isCompleted: false
  },
  {
    id: 2,
    title: "반절의 미학",
    description: "중간 난이도인 레벨 5에 도달",
    icon: "LV5",
    targetValue: 5,
    isCompleted: false
  },
  {
    id: 3,
    title: "정상 도달",
    description: "최고 난이도인 레벨 10에 도달",
    icon: "MAX",
    targetValue: 10,
    isCompleted: false
  },
  {
    id: 4,
    title: "새 학점 달성!",
    description: "정확도 95% 이상으로 한 강의 통과",
    icon: "A+",
    targetValue: 1,
    isCompleted: false
  },
  {
    id: 5,
    title: "최고의 플레이",
    description: "HP 100%로 게임을 클리어",
    icon: "PF",
    targetValue: 1,
    isCompleted: false
  },
  {
    id: 6,
    title: "구사일생",
    description: "HP 20% 아래로 게임을 클리어",
    icon: "SV",
    targetValue: 1,
    isCompleted: false
  },
  {
    id: 7,
    title: "집중력 폭발",
    description: "콤보 50 달성",
    icon: "X50",
    targetValue: 50,
    isCompleted: false
  },
  {
    id: 8,
    title: "개근상",
    description: "7일 이상 게임에 출석",
    icon: "D7",
    targetValue: 7,
    isCompleted: false
  },
  {
    id: 9,
    title: "오버플로우",
    description: "방어선에 단어들이 가득 차 첫 게임 오버 당하기",
    icon: "ERR",
    targetValue: 1,
    isCompleted: false
  },
  {
    id: 10,
    title: "재귀",
    description: "게임 오버 후 포기하지 않고 누적 플레이 10회 달성",
    icon: "RE",
    targetValue: 10,
    isCompleted: false
  },
  {
    id: 11,
    title: "포인트 수집가",
    description: "누적 포인트 1,000점 돌파",
    icon: "1K",
    targetValue: 1000,
    isCompleted: false
  },
  {
    id: 12,
    title: "마스터",
    description: "앞선 11개의 도전과제를 모두 완료",
    icon: "ALL",
    targetValue: 11,
    isCompleted: false
  }
];

export const AchievementManager = {
    init() {
        const saved = JSON.parse(localStorage.getItem('typing_achievements'));
        if (saved && Array.isArray(saved)) {
            challenges.forEach(challenge => {
              if(saved.includes(challenge.id)){
                challenge.isCompleted = true;
              }
            });
        }
    },

    check(id, currentValue) {
        const target = challenges.find(c => c.id === id);
        if (!target || target.isCompleted) return;
        if (currentValue >= target.targetValue) {
            this.complete(target);
        }
    },

    complete(target) {
        target.isCompleted = true;
        this.save();
        UI.showToast(
            target.title, 
            target.description, 
            target.icon
        );
        const completedCount = challenges.filter(c => c.id !== 12 && c.isCompleted).length;
        this.check(12, completedCount);
    },

    save() {
        const completed = challenges
          .filter(c => c.isCompleted)
          .map(c => c.id);
        localStorage.setItem('typing_achievements', JSON.stringify(completed));
    },

    checkAttendance() {
        const today = new Date().toDateString();
        let lastDate = localStorage.getItem('typing_last_date');
        let attendanceDays = parseInt(localStorage.getItem('typing_attendance_days')) || 0;

        if (lastDate !== today) {
            attendanceDays++;
            localStorage.setItem('typing_last_date', today);
            localStorage.setItem('typing_attendance_days', attendanceDays);
        }

        this.check(8, attendanceDays);
    }
};
