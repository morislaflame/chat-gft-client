import type { ProfileInventoryArtifact, ProfileInventoryStory } from '@/types/types';
import { getProfileInventory } from '@/http/userAPI';

/** Одна из реальных картинок — чтобы превью грузилось без плейсхолдеров. */
const IMG_SHIELD =
    'https://chatgft.site/minio/chat-gft-test/artifact/fb021c9a-61ad-4c14-8a41-8d6d3da02608.png';
const IMG_BLASTER =
    'https://chatgft.site/minio/chat-gft-test/artifact/a2160643-c7a5-46f5-87cd-9f8cfd74fae4.png';
const IMG_PASS =
    'https://chatgft.site/minio/chat-gft-test/artifact/2803df7d-b403-4269-bdee-179508d8d05c.png';

function mockImg(id: number, url: string): NonNullable<ProfileInventoryArtifact['media']> {
    return { id, url, mimeType: 'image/png' };
}

/**
 * Дополнительные истории (две) с артефактами уровней 1 и 2 для превью верстки профиля.
 * Подставляются к ответу API только в {@link import.meta.env.DEV}.
 */
export const PROFILE_INVENTORY_MOCK_STORIES: ProfileInventoryStory[] = [
    {
        historyName: 'preview_noir_city',
        displayName: 'Нуар-сити',
        displayNameEn: 'Noir City',
        artifacts: [
            {
                id: 91001,
                code: 'NOIR_DETECTIVE_BADGE',
                name: 'Значок детектива',
                nameEn: 'Detective Badge',
                level: 1,
                boostType: 'KEY',
                description: 'Доступ к архивам и допросам.',
                descriptionEn: 'Access to archives and interrogations.',
                media: mockImg(910011, IMG_PASS),
            },
            {
                id: 91002,
                code: 'NOIR_REVOLVER',
                name: 'Револьвер',
                nameEn: 'Revolver',
                level: 1,
                boostType: 'WEAPON',
                description: 'Резкая переговорная позиция.',
                descriptionEn: 'Strong negotiation tool.',
                media: mockImg(910021, IMG_BLASTER),
            },
            {
                id: 91003,
                code: 'NOIR_TRENCH_NOTE',
                name: 'Записка из канавы',
                nameEn: 'Trench Coat Note',
                level: 1,
                boostType: 'TRINKET',
                description: 'Подсказки из подпольных баров.',
                descriptionEn: 'Clues from underground bars.',
                media: mockImg(910031, IMG_SHIELD),
            },
            {
                id: 91004,
                code: 'NOIR_SAFE_CRACK',
                name: 'Слуховой щуп',
                nameEn: 'Safe Ear',
                level: 2,
                boostType: 'TRINKET',
                description: 'Открывает сейфы без шума.',
                descriptionEn: 'Silent safecracking.',
                media: mockImg(910041, IMG_SHIELD),
            },
            {
                id: 91005,
                code: 'NOIR_WITNESS_PROT',
                name: 'Программа защиты',
                nameEn: 'Witness Protection',
                level: 2,
                boostType: 'ARMOR',
                description: 'Скрывает следы свидетеля.',
                descriptionEn: 'Hides witness trail.',
                media: mockImg(910051, IMG_SHIELD),
            },
            {
                id: 91006,
                code: 'NOIR_BLACK_CAR',
                name: 'Чёрное такси',
                nameEn: 'Black Car',
                level: 2,
                boostType: 'KEY',
                description: 'Быстрый отход со сцены.',
                descriptionEn: 'Fast exit from scenes.',
                media: mockImg(910061, IMG_PASS),
            },
        ],
        /** Часть L1 есть — уровень 2 в UI заблокирован до полного сбора L1. */
        owned: {
            NOIR_REVOLVER: 1,
        },
        found: {},
        unlockedLevels: [1],
    },
    {
        historyName: 'preview_orbit_station',
        displayName: 'Орбитальная база',
        displayNameEn: 'Orbital Outpost',
        artifacts: [
            {
                id: 92001,
                code: 'ORB_O2_SCRUBBER',
                name: 'Рециркулятор кислорода',
                nameEn: 'O₂ Scrubber',
                level: 1,
                boostType: 'ARMOR',
                description: 'Дольше без скафандра в разгерметизации.',
                descriptionEn: 'Longer survivability during breach.',
                media: mockImg(920011, IMG_SHIELD),
            },
            {
                id: 92002,
                code: 'ORB_RAIL_GUN_CHIP',
                name: 'Чип наведения РЭЛК',
                nameEn: 'Railgun Chip',
                level: 1,
                boostType: 'WEAPON',
                description: 'Точные выстрелы по обломкам.',
                descriptionEn: 'Precision shots at debris.',
                media: mockImg(920021, IMG_BLASTER),
            },
            {
                id: 92003,
                code: 'ORB_PATCH_KIT',
                name: 'Аварийная заплатка',
                nameEn: 'Hull Patch Kit',
                level: 1,
                boostType: 'KEY',
                description: 'Закупорка микродыр в корпусе.',
                descriptionEn: 'Seals micro-breaches.',
                media: mockImg(920031, IMG_PASS),
            },
            {
                id: 92005,
                code: 'ORB_PLASMA_CUT',
                name: 'Плазмотёр',
                nameEn: 'Plasma Cutter',
                level: 2,
                boostType: 'WEAPON',
                description: 'Режет любые ставни шлюза.',
                descriptionEn: 'Cuts any bulkhead.',
                media: mockImg(920051, IMG_BLASTER),
            },
            {
                id: 92006,
                code: 'ORB_CORE_KEY',
                name: 'Ключ реактора',
                nameEn: 'Reactor Key',
                level: 2,
                boostType: 'KEY',
                description: 'Допуск к реакторной камере.',
                descriptionEn: 'Reactor chamber access.',
                media: mockImg(920061, IMG_PASS),
            },
            {
                id: 92007,
                code: 'ORB_SENSOR_NET',
                name: 'Датчик сети давления',
                nameEn: 'Pressure Net Sensor',
                level: 2,
                boostType: 'TRINKET',
                description: 'Обнаружение утечки до звонка тревоги.',
                descriptionEn: 'Detect leaks before alarms.',
                media: mockImg(920071, IMG_SHIELD),
            },
        ],
        companion: {
            id: 92004,
            code: 'ORB_DRONE_MAINT',
            name: 'Тех-дрон MX-9',
            nameEn: 'MX-9 Tech Drone',
            description: 'Ремонт и разведка в шлюзе.',
            descriptionEn: 'Repair & scout in airlocks.',
            media: mockImg(920041, IMG_SHIELD),
            owned: true,
        },
        /** Весь уровень 1 собран — уровень 2 открыт; на L2 частичный прогресс. */
        owned: {
            ORB_O2_SCRUBBER: 1,
            ORB_RAIL_GUN_CHIP: 1,
            ORB_PATCH_KIT: 1,
            ORB_PLASMA_CUT: 1,
        },
        found: {},
        unlockedLevels: [1, 2],
    },
];

/** В dev к ответу API добавляет мок-истории, не дублируя уже пришедшие `historyName`. */
export function mergeProfileInventoryStoriesForPreview(stories: ProfileInventoryStory[]): ProfileInventoryStory[] {
    if (!import.meta.env.DEV) return stories;
    const seen = new Set(stories.map((s) => s.historyName));
    const extras = PROFILE_INVENTORY_MOCK_STORIES.filter((s) => !seen.has(s.historyName));
    return [...stories, ...extras];
}

/** Инвентарь с dev-моками — общая загрузка для списка и страницы сюжета. */
export async function loadMergedProfileStories(): Promise<ProfileInventoryStory[]> {
    const data = await getProfileInventory();
    return mergeProfileInventoryStoriesForPreview(data.stories ?? []);
}
