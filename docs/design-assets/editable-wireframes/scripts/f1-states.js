/* 화면에서 실제로 필요한 상태만 나열한다. UI 미리보기이며 서버 결과를 만들지 않는다. */
const F1_STATES = {
  "AUTH-01": {ready:"기본", "field-error":"필수 입력 오류", "invalid-credentials":"인증 실패", "account-restricted":"계정 정지", withdrawn:"탈퇴 계정", submitting:"로그인 중", error:"통신·서버 오류", "storage-error":"로그인 실패"},
  "AUTH-02": {ready:"미선택", "field-error":"필드 오류", "password-mismatch":"비밀번호 확인 불일치", "duplicate-email":"중복 이메일", submitting:"가입 중", error:"서버 오류", "result-unknown":"가입 결과 불명확", "storage-error":"가입 후 로그인 실패"},
  "AUTH-03": {ready:"공통 복원 스피너", "read-error":"기기 정보 읽기 실패", "refresh-error":"갱신 통신 실패", "storage-error":"로그인 확인 실패", "me-error":"내 정보 조회 실패", "invalid-session":"다시 로그인 필요", expired:"세션 종료"},
  "AUTH-04": {ready:"로그아웃 확인", submitting:"로그아웃 중", "server-unconfirmed":"서버 종료 미확인·기기 정리 완료", "cleanup-error":"기기 정리 실패", success:"로그아웃 완료"},
  "GUARDIAN-01": {ready:"조회 완료", loading:"조회 중", error:"조회 실패"},
  "GUARDIAN-EDIT": {ready:"기존 성별 읽기 전용", "gender-unset":"최초 개인 성별 설정", couple:"커플", family:"가족", paused:"쉬는 중", "field-error":"입력 오류", submitting:"저장 중", error:"저장 실패", conflict:"동시 수정 충돌", "photo-uploading":"사진 업로드 중", "photo-error":"사진 업로드 실패"},
  "GUARDIAN-02": {ready:"탈퇴 확인", submitting:"탈퇴 중", error:"탈퇴 요청 거부", "result-unknown":"탈퇴 결과 불명확", "cleanup-error":"탈퇴 성공·기기 정리 실패", success:"탈퇴 완료"},
};
