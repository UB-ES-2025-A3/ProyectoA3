
# Instalación 

cd frontend
npm install -D @playwright/test
npx playwright install


# A ejecutar

npx playwright test
npx playwright test --debug
npx playwright test tests/signup.spec.ts --debug


# Tests que no son e2e

local

cd frontend

npm test -- EventModal
npm test -- ProfilePage
npm test -- SplashPage
npm test -- App

cuando salga todo verde

CI=true npm test
