import { useCallback } from 'react';
import { useStore } from '../lib/store';

export const usePomodoro = () => {
  const { 
    isBreak, 
    setRemainingTime, 
    focusTime, 
    breakTime,
  } = useStore();

  // 時間をフォーマットする関数にNaNチェックを追加
  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) {
      console.log('Invalid time value:', time);
      time = 0;
    }
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // タイマーをインタラクティブに操作する関数
  const handleCircleInteraction = useCallback((percentage: number) => {
    const totalTime = isBreak ? breakTime * 60 : focusTime * 60;
    const newTime = Math.round(totalTime * percentage);
    setRemainingTime(newTime);
  }, [isBreak, breakTime, focusTime, setRemainingTime]);

  return {
    formatTime,
    handleCircleInteraction,
  };
};