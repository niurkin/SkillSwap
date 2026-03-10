import { type IUserPublic, type IUser } from '../entities/user/model/types/types'
import { type IRegisterData } from '../features/auth/types/types';
import { multiplyArrayElements } from '../utils/multiplyArrayElements';
import { type INotification } from '../features/requests/types/types';

export interface ILoginData {
  email: string;
  password: string;
}

interface IToken {
  accessToken: string;
}

export type IAuthResponse = IToken & {
  user: IUser;
};

export type TLikeResponse = {
  status: 'added' | 'removed';
  userId: string;
};

export interface logoutResponse {
  success: boolean;
}

interface IErrorResponse {
  status: number;
  message: string;
}

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

const toPublicUser = (user: IUser): IUserPublic => {
  const {
    email,
    password,
    favorites,
    incomingRequests,
    outgoingRequests,
    exchanges,
    notifications,
    ...rest
  } = user;
  return rest;
};


const createNotification = async (
  type: 'request' | 'accept' | 'decline',
  fromId: string,
  toId: string
): Promise<INotification> => {
  const users = getStoredUsers();
  const fromUser = users.find((u) => u.id === fromId);
  if (!fromUser) throw { status: 404, message: 'Пользователь не найден' } as IErrorResponse;

  const allSkills = await mockGetSkills();
  const toUser = allSkills.find((u) => u.id === toId);
  if (!toUser) throw { status: 404, message: 'Пользователь не найден' } as IErrorResponse;

  return {
    id: Date.now().toString() + Math.floor(Math.random() * 1000),
    type,
    date: new Date().toISOString(),
    from: toPublicUser(fromUser),
    to: toUser,
  };
};

const uploadImageToImgBB = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    {
      method: 'POST',
      body: formData,
    }
  );
  const data = await response.json();
  if (data.success) {
    return data.data.display_url;
  } else {
    throw new Error('Не удалось загрузить изображение: ' + data.error.message);
  }
};

const getStoredUsers = (): IUser[] => {
  const data = localStorage.getItem('users');
  return data ? JSON.parse(data) : [];
};

const setStoredUsers = (users: IUser[]) => {
  localStorage.setItem('users', JSON.stringify(users));
};

const updateStoredUser = (userId: string, update: Partial<IUser>) => {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1)
    throw { status: 404, message: 'Пользователь не найден' } as IErrorResponse;
  users[index] = { ...users[index], ...update };
  setStoredUsers(users);
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const createToken = async (): Promise<IToken> => {
  await delay(50);
  const accessToken = 'mockAccessToken-' + Date.now();
  return { accessToken };
};

const getCurrentUser = (): IUser => {
  const currentUserId = localStorage.getItem('currentUser');
  const users = getStoredUsers();
  const user = users.find((u) => u.id === currentUserId);
  if (!user)
    throw { status: 404, message: 'Пользователь не найден' } as IErrorResponse;
  return user;
};

// Получение карточек

export const mockGetSkills = async (): Promise<IUserPublic[]> => {
  await delay(200);
  const response = await fetch('/db/users.json');
  const data: IUserPublic[] = await response.json();
  return multiplyArrayElements(data);
};

export const mockGetSkillById = async (id: string): Promise<IUserPublic | null> => {
  await delay(200);
  const response = await fetch('/db/users.json');
  const data: IUserPublic[] = await response.json();
  const expanded = multiplyArrayElements(data);
  const skill = expanded.find((user) => user.id === id) || null;
  return skill;
};

export const mockGetSimilarSkills = async (userId: string): Promise<IUserPublic[]> => {
  const allSkills = await mockGetSkills();
  const user = allSkills.find(u => u.id === userId);
  if (!user?.can?.subcategory) return [];
  return allSkills.filter(
    s => s.can?.subcategory === user.can.subcategory && s.id !== user.id
  );
};

// Добавление /удаление избранного

export const mockToggleFavorites = async (
  likedId: string
): Promise<TLikeResponse> => {
  await delay(200);
  const user = getCurrentUser();
  let status: 'added' | 'removed';
  if (user.favorites.includes(likedId)) {
    user.favorites = user.favorites.filter((id) => id !== likedId);
    status = 'removed';
  } else {
    user.favorites.push(likedId);
    status = 'added';
  }
  updateStoredUser(user.id, { favorites: user.favorites });
  return { userId: likedId, status: status };
};

// Заявка на обмен навыками

export const mockRequest = async (requestedId: string): Promise<INotification> => {
  await delay(50);
  const user = getCurrentUser();

  if (!user.outgoingRequests.includes(requestedId)) {
    user.outgoingRequests.push(requestedId);
  }

  const notification = await createNotification('request', user.id, requestedId);
  user.notifications.new.push(notification);

  updateStoredUser(user.id, {
    outgoingRequests: user.outgoingRequests,
    notifications: user.notifications,
  });

  return notification;
};

// Отклонение заявки

export const mockDecline = async (declinedId: string): Promise<INotification> => {
  await delay(200);
  const user = getCurrentUser();

  if (user.incomingRequests.includes(declinedId)) {
    user.incomingRequests = user.incomingRequests.filter((id) => id !== declinedId);
  }

  const notification = await createNotification('decline', user.id, declinedId);
  user.notifications.new.push(notification);

  updateStoredUser(user.id, {
    incomingRequests: user.incomingRequests,
    notifications: user.notifications,
  });

  return notification;
};

// Принятие заявки

export const mockAccept = async (acceptedId: string): Promise<INotification> => {
  await delay(200);
  const user = getCurrentUser();

  if (!user.exchanges.includes(acceptedId)) {
    user.exchanges.push(acceptedId);
  }
  if (user.incomingRequests.includes(acceptedId)) {
    user.incomingRequests = user.incomingRequests.filter((id) => id !== acceptedId);
  }

  const notification = await createNotification('accept', user.id, acceptedId);
  user.notifications.new.push(notification);

  updateStoredUser(user.id, {
    exchanges: user.exchanges,
    incomingRequests: user.incomingRequests,
    notifications: user.notifications,
  });

  return notification;
};

// Просмотр уведомления

export const mockViewNotification = async (notificationId: string): Promise<INotification> => {
  await delay(100);
  const user = getCurrentUser();

  const notification = user.notifications.new.find(n => n.id === notificationId);
  if (!notification) {
    throw { status: 404, message: 'Уведомление не найдено' } as IErrorResponse;
  }

  user.notifications.new = user.notifications.new.filter(n => n.id !== notificationId);

  if (!user.notifications.viewed.some(n => n.id === notificationId)) {
    user.notifications.viewed.push(notification);
  }

  updateStoredUser(user.id, { notifications: user.notifications });

  return notification;
};

// Просмотр всех уведомлений

export const mockViewAllNotifications = async (): Promise<INotification[]> => {
  await delay(100);
  const user = getCurrentUser();

  const notificationsToMove = [...user.notifications.new];
  user.notifications.viewed.push(...notificationsToMove);
  user.notifications.new = [];

  updateStoredUser(user.id, { notifications: user.notifications });

  return notificationsToMove;
};

// Удалиение всех просмотренных уведомлений

export const mockRemoveViewedNotifications = async (): Promise<string[]> => {
  await delay(100);
  const user = getCurrentUser();

  const removedIds = user.notifications.viewed.map(n => n.id);
  user.notifications.viewed = [];

  updateStoredUser(user.id, { notifications: user.notifications });

  return removedIds;
};

// Получение пользователя

export const mockGetUser = async (): Promise<{ user: IUser }> => {
  await delay(100);
  const user = getCurrentUser();
  return { user };
};

// Обновление данных пользователя

export const mockUpdateUser = async (
  update: Partial<IRegisterData>
): Promise<IUser> => {
  await delay(200);
  const user = getCurrentUser();

  const userImageUrl = update.image ? await uploadImageToImgBB(update.image) : user.image;

  const skillImageUrls = update.can?.images
    ? await Promise.all(update.can.images.map((img) => uploadImageToImgBB(img)))
    : user.can.images;

  const updatedUser: IUser = {
    ...user,
    ...update,
    image: userImageUrl,
    can: {
      ...user.can,
      ...update.can,
      images: skillImageUrls,
    },
  };

  updateStoredUser(user.id, updatedUser);

  return updatedUser;
};


// Регистрация пользователя (пользователь добавляется в local storage)

export const mockRegisterUser = async (
  data: IRegisterData
): Promise<IAuthResponse> => {
  await delay(100);

  const userImageUrl = data.image ? await uploadImageToImgBB(data.image) : '';

  const skillImageUrls = await Promise.all(
    data.can.images?.map((image) => uploadImageToImgBB(image)) || []
  );

  const users = getStoredUsers();
  const newUser: IUser = {
    ...data,
    id: Date.now().toString() + Math.floor(Math.random() * 1000),
    likeCount: 0,
    favorites: [],
    incomingRequests: [],
    outgoingRequests: [],
    exchanges: [],
    notifications: { new: [], viewed: [] },
    createdAt: new Date().toISOString(),
    image: userImageUrl,
    can: {
      ...data.can,
      images: skillImageUrls,
    },
  };

  users.push(newUser);
  setStoredUsers(users);
  localStorage.setItem('currentUser', newUser.id);

  const token = await createToken();
  return { user: newUser, ...token };
};


// Логин пользователя

export const mockLoginUser = async (
  data: ILoginData
): Promise<IAuthResponse> => {
  await delay(300);
  const users = getStoredUsers();
  const user = users.find(
    (u) => u.email === data.email && u.password === data.password
  );
  if (!user)
    throw { status: 401, message: 'Такого пользователя не существует' } as IErrorResponse;
  localStorage.setItem('currentUser', user.id);
  const token = await createToken();
  return { user, ...token };
};

// Выход пользователя

export const mockLogout = async (): Promise<logoutResponse> => {
  await delay(100);
  localStorage.removeItem('currentUser');
  return { success: true };
};
