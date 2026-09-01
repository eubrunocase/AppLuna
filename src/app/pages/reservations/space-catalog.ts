import { SpaceType } from '../../core/models/enums';

export interface SpaceCatalogEntry {
  name: string;
  description: string;
  imageSrc: string;
}

export const SPACE_CATALOG: Record<string, SpaceCatalogEntry> = {
  [SpaceType.SALAO_FESTAS]: {
    name: 'Salão de Festas',
    description: 'Para eventos e comemorações',
    imageSrc: 'assets/images/spaces/salao-festas.jpg',
  },
  [SpaceType.CHURRASQUEIRA]: {
    name: 'Churrasqueira',
    description: 'Para confraternizações',
    imageSrc: 'assets/images/spaces/churrasqueira.jpg',
  },
  [SpaceType.ACADEMIA]: {
    name: 'Academia',
    description: 'Treinos e exercícios',
    imageSrc: 'assets/images/spaces/academia.jpg',
  },
  [SpaceType.CAMPO_FUTEBOL]: {
    name: 'Campo de Futebol',
    description: 'Jogos e esportes',
    imageSrc: 'assets/images/spaces/campo-futebol.jpg',
  },
  TELEVISAO: {
    name: 'Televisão Comunitária',
    description: 'Uso comunitário gratuito',
    imageSrc: 'assets/images/spaces/televisao.jpg',
  },
};

export function getSpaceCatalogEntry(type: string | null | undefined): SpaceCatalogEntry | null {
  if (!type) return null;
  return SPACE_CATALOG[type.trim().toUpperCase()] ?? null;
}
