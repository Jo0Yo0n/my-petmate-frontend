import { useEffect, useRef, useState } from 'react';

// API 연결 전 제출 중 화면을 확인하기 위한 모의 동작이다.
export function usePreviewSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function submitPreview(onComplete: () => void) {
    // state 반영 전 같은 이벤트 루프에서 들어오는 중복 호출도 차단한다.
    if (timer.current !== undefined) return;
    setIsSubmitting(true);
    timer.current = setTimeout(() => {
      timer.current = undefined;
      setIsSubmitting(false);
      onComplete();
    }, 800);
  }

  return { isSubmitting, submitPreview };
}
