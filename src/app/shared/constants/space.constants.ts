import { SpaceType } from '../../core/models/enums';

export const SPACE_LABELS: Record<SpaceType, string> = {
  [SpaceType.SALAO_FESTAS]: 'Salão de Festas',
  [SpaceType.CHURRASQUEIRA]: 'Churrasqueira',
  [SpaceType.CAMPO_FUTEBOL]: 'Campo de Futebol'
};

export const SPACE_ICONS: Record<SpaceType, string> = {
  [SpaceType.SALAO_FESTAS]: 'people-outline',
  [SpaceType.CHURRASQUEIRA]: 'flame-outline',
  [SpaceType.CAMPO_FUTEBOL]: 'football-outline'
};

export const SPACE_EQUIPMENT_CATALOG: Record<SpaceType, string[]> = {
  [SpaceType.SALAO_FESTAS]: ['Mesas', 'Cadeiras', 'Freezer 1', 'Freezer 2', 'Fogão', 'Televisão'],
  [SpaceType.CHURRASQUEIRA]: ['Grelhas', 'Aparatos de churrasco', 'Cadeiras', 'Tábuas', 'Freezer'],
  [SpaceType.CAMPO_FUTEBOL]: []
};

export const EXCLUSIVE_SPACE_TYPES: SpaceType[] = [
  SpaceType.SALAO_FESTAS,
  SpaceType.CHURRASQUEIRA,
  SpaceType.CAMPO_FUTEBOL
];

export const SPACE_COLORS: Record<SpaceType, { background: string; iconColor: string }> = {
  [SpaceType.SALAO_FESTAS]: { background: '#e3f2fd', iconColor: '#1976d2' },
  [SpaceType.CHURRASQUEIRA]: { background: '#fff3e0', iconColor: '#f57c00' },
  [SpaceType.CAMPO_FUTEBOL]: { background: '#f3e5f5', iconColor: '#6a1b9a' }
};

export function getSpaceLabel(type: string): string {
  return SPACE_LABELS[type as SpaceType] || type;
}

export function getSpaceIcon(type: string): string {
  return SPACE_ICONS[type as SpaceType] || 'cube-outline';
}
