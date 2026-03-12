# SkillSwap — платформа для обмена навыками

SkillSwap — это учебный проект, созданный в рамках курса «Фронтенд-разработчик» от «Яндекс Практикума». Здесь пользователи могут предлагать обучение своим навыкам в обмен на навыки других пользователей.

 <p align="center">
 <img src=".github/assets/screenshots/main-screen.jpg" width="70%" />
 </p>

  ## Технологии

 <table align="center">
  <tr>
    <td align="center">
      <img src="https://skillicons.dev/icons?i=html" width="50"/><br/>
      <sub>HTML5</sub>
    </td>
    <td align="center">
      <img src="https://skillicons.dev/icons?i=scss" width="50"/><br/>
      <sub>SCSS</sub>
    </td>
    <td align="center">
      <img src="https://skillicons.dev/icons?i=typescript" width="50"/><br/>
      <sub>TypeScript</sub>
    </td>
   <td align="center">
      <img src="https://skillicons.dev/icons?i=vite" width="50"/><br/>
      <sub>Vite</sub>
    </td>
   <td align="center">
      <img src="https://skillicons.dev/icons?i=react" width="50"/><br/>
      <sub>React</sub>
    </td>
   <td align="center">
      <img src="https://skillicons.dev/icons?i=redux" width="50"/><br/>
      <sub>Redux</sub>
    </td>
  </tr>
</table>

## Особенности

- Прокрутка карточек с бесконечной подгрузкой с сервера

 <p align="center">
 <img src=".github/assets/screenshots/scroll.gif" width="50%" />
 </p>

 - Просмотр подробных сведений о навыках с возможностью поставить лайк и предложить обмен

 <p align="center">
 <img src=".github/assets/screenshots/preview.gif" width="50%" />
 </p>

 - Текстовый поиск по навыкам

 <p align="center">
 <img src=".github/assets/screenshots/search.gif" width="50%" />
 </p>

  - Фильтрация навыков по категориям, полу и городу

 <p align="center">
 <img src=".github/assets/screenshots/filter.gif" width="50%" />
 </p>

 - Регистрация и авторизация пользователей

 <p align="center">
 <img src=".github/assets/screenshots/register.gif" width="30%" />
 </p>

 - Управление уведомлениями

 <p align="center">
 <img src=".github/assets/screenshots/notifications.gif" width="30%" />
 </p>

## Запуск

- Установка зависимостей: `npm install`

- Запуск dev-сервера: `npm run dev`

- Запуск Storybook: `npm run storybook`

## Архитектура

В архитектуре проекта используются принципы FSD (Feature-Sliced Design).

- Слой `shared` содержит общие ресурсы, хуки, лэйауты, хэлперы, типы и компоненты интерфейса.

- Слой `entities` содержит слайсы `skill` и `user` с соответствующими компонентами интерфейса и слайсами хранилища.

- Слой `features` содержит слайсы авторизации, фильтрации, запросов и навыков.

- Слой `widgets` содержит слайсы шапки сайта, карточки и панели фильтров.

- Слой `pages` содержит страницы приложения.

- Слой `app` содержит `App.tsx`, стили и хранилище Redux.

## Задачи

Команде требовалось сделать с нуля MVP клиентской части приложения. Я осуществлял функции тимлида и выполнял следующие задачи.

- Настроил комплексное окружение разработки.

- Продумал архитектуру приложения.

- Формулировал задачи, декомпозировал требования и приоритизировал бэклог.

- Проводил код-ревью.

- Разработал моковый API на основе Local Storage.
