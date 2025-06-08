import { CrimeType, NS } from '@ns';

export interface GUILabelList {
  labels: string[];
  dividerLengths: number[];
}

export interface GUIDataList {
  data: (string | number)[];
  dividerLengths: number[];
}

export interface ColourList {
  formatDashboardTitleColour: number;
  borderColour: number;
  labelColour: number;
  dataColour: number;
  criticalColour: number;
  shadowColour: number;
}

export interface RenderDashboard {
  ns: NS;
  renderQueue: string[];
  currentHost: string;
  maxDashboardWidth: number;
  characters: Characters;
  labelLists: { [key: string]: GUILabelList };
  dataLists: { [key: string]: GUIDataList };
  colourList: ColourList;
}

export interface Characters {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
  leftDivider: string;
  rightDivider: string;
  spaceFilled: string;
  spaceEmpty: string;
}
