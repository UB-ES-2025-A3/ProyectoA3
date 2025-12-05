
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

npm test -- CreateEventForm.test.js
...

cuando salga todo verde



# ver coverage

npm run test:coverage
