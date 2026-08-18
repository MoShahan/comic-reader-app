import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  Library: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<RootTabParamList>;
  ComicDetail: { comicId: string };
  Reader: { comicId: string; startFromBeginning?: boolean };
};
