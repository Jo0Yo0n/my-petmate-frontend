/* 화면 콘텐츠의 원본. 실제 API가 아니라 디자인용 모의 데이터다. */
const PHOTO = 'assets/login-dog.png';
const DOGS = [
  {
    id: 'gureum',
    name: '구름',
    age: 3,
    size: '중형견',
    identity: '남성 보호자',
    guardian: { nickname: '구름네', photoUrl: null, activityRegions: [{id: 'locality-demo-mangwon', displayName: '서울특별시 마포구 망원동'}], availableTimeSlots: [{dayOfWeek: 'saturday', startTime: '10:00', endTime: '12:00'}] },
    sizeGroup: 'medium', preferredWalkIntensity: 'moderate', unfamiliarDogReaction: 'calm', guardianIdentity: 'male',
    intro:
      '처음에는 천천히 인사하고, 익숙해지면 나란히 걷는 것을 좋아해요. 주말 오전에 조용한 길을 함께 걸을 친구를 찾고 있어요.',
  },
  {
    id: 'dubu',
    name: '두부',
    age: 2,
    size: '중형견',
    identity: '가족 보호자',
    guardian: { nickname: '두부네', photoUrl: null, activityRegions: [{id: 'locality-demo-yeonnam', displayName: '서울특별시 마포구 연남동'}], availableTimeSlots: [{dayOfWeek: 'sunday', startTime: '09:00', endTime: '11:00'}] },
    sizeGroup: 'medium', preferredWalkIntensity: 'slow', unfamiliarDogReaction: 'cautious', guardianIdentity: 'family',
    intro:
      '냄새를 맡으며 여유롭게 걷는 것을 좋아해요. 충분히 거리를 두고 인사한 다음 함께 걸어요.',
  },
];
const SCREENS = [
  ['AUTH-01', '로그인', 'login', 'auth'],
  ['AUTH-02', '회원가입', 'signup', 'auth'],
  ['AUTH-03', '세션 복원 스피너 (공통 상태)', 'restore', 'auth'],
  ['AUTH-04', '로그아웃 확인', 'logout', 'auth'],
  ['DOG-EMPTY', '등록된 반려견 없음', 'dogEmpty', 'dogs'],
  ['DOG-01', '내 반려견', 'dogs', 'dogs'],
  ['DOG-02', '반려견 등록 · 기본', 'dogBasic', 'dogs'],
  ['DOG-03', '반려견 등록 · 건강', 'dogHealth', 'dogs'],
  ['DOG-04', '반려견 등록 · 성향', 'dogBehavior', 'dogs'],
  ['DOG-05', '반려견 등록 · 소개', 'dogIntro', 'dogs'],
  ['DOG-06', '내 반려견 상세', 'dogDetail', 'dogs'],
  ['GUARDIAN-01', '내 정보', 'guardianInfo', 'guardian'],
  ['GUARDIAN-EDIT', '내 정보 수정', 'guardian', 'guardian'],
  ['GUARDIAN-02', '탈퇴 확인', 'withdraw', 'auth'],
  ['REC-01', '산책 메이트 찾기', 'recommendations', 'recommendations'],
  ['REC-02', '선호 조건', 'filters', 'recommendations'],
  ['REC-03', '추천 상세', 'detail', 'recommendations'],
  ['REC-SENT', '관심 전송 완료', 'sent', 'recommendations'],
  ['REC-04', '매칭 성사', 'mutual', 'matches'],
  ['REC-PAUSED', '잠시 쉬는 중', 'paused', 'recommendations'],
  ['MATCH-01', '매칭', 'matches', 'matches'],
  ['LIKES-01', '받은 관심', 'likes', 'matches'],
  ['LIKES-02', '받은 관심 상세', 'likeDetail', 'matches'],
  ['LIKES-SENT', '보낸 관심', 'sentLikes', 'matches'],
  ['CHAT-SETTINGS', '채팅 설정', 'chatSettings', 'matches'],
  ['CHAT-01', '구름 · 보낸 제안 취소됨', 'chat', 'matches'],
  ['CHAT-02', '두부 · 받은 제안 성사됨', 'chat', 'matches'],
  ['MATCH-CLOSE-01', '매칭 종료', 'close', 'matches'],
  ['APPT-LIST', '약속 목록', 'appointments', 'matches'],
  ['APPT-01', '약속 제안', 'appointment', 'matches'],
  ['APPT-02', '받은 제안', 'receivedAppointment', 'matches'],
  ['APPT-ACCEPTED', '성사된 약속', 'acceptedAppointment', 'matches'],
  ['APPT-03', '약속 취소', 'cancelAppointment', 'matches'],
  ['APPT-04', '만남 후 평가', 'review', 'matches'],
  ['SAFE-01', '차단 확인', 'block', 'matches'],
  ['SAFE-02', '신고', 'report', 'matches'],
  ['F1-REC', '추천 · F1 탭 셸', 'f1Recommendations', 'recommendations'],
  ['F1-MATCH', '매칭 · F1 탭 셸', 'f1Matches', 'matches'],
  ['F1-DOG', '내 반려견 · F1 탭 셸', 'f1Dogs', 'dogs'],
].map(([id, title, view, tab]) => {
  const milestone =
    id.startsWith('AUTH') || id.startsWith('GUARDIAN') || id.startsWith('F1-')
      ? 'F1'
      : id.startsWith('DOG')
        ? 'F2'
        : [
              'REC-SENT',
              'REC-04',
              'MATCH-01',
              'LIKES-01',
              'LIKES-02',
              'LIKES-SENT',
            ].includes(id)
          ? 'F4'
          : id.startsWith('REC')
            ? 'F3'
            : id.startsWith('APPT')
              ? 'F6'
              : id.startsWith('SAFE')
                ? 'F7'
                : 'F5';
  const dependencies = id.startsWith('CHAT') ? 'F6 약속 · F7 안전' : '';
  const designed =
    milestone === 'F1' ||
    ['REC-01', 'REC-03', 'CHAT-01', 'CHAT-02'].includes(id);
  return {
    id,
    title,
    view,
    tab,
    milestone,
    dependencies,
    designed,
    presentation: ['REC-04', 'APPT-01', 'APPT-03', 'APPT-04', 'SAFE-02'].includes(id) ? 'sheet' : 'screen',
    kind: id === 'AUTH-03' ? 'state' : 'screen',
  };
});
