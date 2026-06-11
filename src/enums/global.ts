export enum PathFor {
  homePage = '/',
  profileIntakePage = '/profile',
  assessmentIntroPage = '/assessment/intro',
  clientConversationPage = '/assessment/chat',
  buildSubmissionPage = '/assessment/submit',
  gradingPage = '/assessment/grading',
  gapReportPage = '/assessment/result',
  paywallPage = '/paywall',
  guidedBuildPathPage = '/path',
  coachingPracticePage = '/path/practice',
  reAssessmentIntroPage = '/reassessment/intro',
  companiesWantYouPage = '/placement/interest',
  statusTrackerPage = '/placement/status',
  loginPage = '/login',
  markAvailablePage = '/availability',
  adminReviewQueuePage = '/admin/review',
}

export enum StudentStateKey {
  new = 'a',
  learningPath = 'b',
  passedProfileGate = 'c',
  inPool = 'd',
}
