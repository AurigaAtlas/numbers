// The two learning paths share one player (Path.jsx); each course says what it teaches.
import {
  buildDaily,
  buildSteps,
  dailyLesson,
  learnedLetters,
  lessonReward,
  listenItems,
  nextLessonIndex,
  pathLessons,
  pathUnits
} from "./path";
import {
  buildNumberDaily,
  buildNumberSteps,
  learnedNumbers,
  nextNumberLesson,
  numberDaily,
  numberLessonReward,
  numberLessons,
  numberListenItems,
  numberUnits
} from "./numberPath";

export const courses = {
  hangul: {
    id: "hangul",
    title: "한글 길",
    subtitle: "ㄱ부터 차례대로, 한 칸씩 배워요",
    itemWord: "글자",
    theme: "pink",
    units: pathUnits,
    lessons: pathLessons,
    next: nextLessonIndex,
    learned: learnedLetters,
    build: (lesson, context) => (lesson.kind === "daily" ? buildDaily(context) : buildSteps(lesson, context)),
    listenItems,
    reward: lessonReward,
    daily: dailyLesson,
    isReview: (lesson) => lesson.kind === "review" || lesson.kind === "rowReview"
  },
  numbers: {
    id: "numbers",
    title: "숫자 길",
    subtitle: "1부터 차례대로, 한 칸씩 배워요",
    itemWord: "숫자",
    theme: "sky",
    units: numberUnits,
    lessons: numberLessons,
    next: nextNumberLesson,
    learned: learnedNumbers,
    build: (lesson, context) => (lesson.kind === "daily" ? buildNumberDaily(context) : buildNumberSteps(lesson, context)),
    listenItems: numberListenItems,
    reward: numberLessonReward,
    daily: numberDaily,
    isReview: (lesson) => lesson.kind === "review"
  }
};

// 오늘의 복습 opens once a course has two things to review.
export function reviewReady(course, stars, review) {
  return course.learned(stars, review).length >= 2;
}
