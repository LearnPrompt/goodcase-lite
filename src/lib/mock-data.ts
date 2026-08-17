export type CaseCategory = "image" | "video" | "web" | "copy" | "hardware";

export type CaseItem = {
  slug: string;
  title: string;
  category: CaseCategory;
  source: string;
  sourceUrl?: string;
  sourceLikeCount?: number;
  sourceCommentCount?: number;
  sourceShareCount?: number;
  sourceSaveCount?: number;
  sourcePublishedAt?: string;
  sourceMetricsCapturedAt?: string;
  creator: string;
  creatorAvatarUrl?: string;
  summary: string;
  promptPreview: string;
  promptFull: string;
  contentLocale?: "zh-CN" | "en";
  promptTranslationZh?: string;
  promptTranslationEn?: string;
  resultBreakdown?: [string, string, string];
  mediaType: "image" | "video";
  mediaUrl: string;
  posterUrl?: string;
  likedCount: number;
  remakeCount: number;
  stabilityScore: number;
  favoriteScore: number;
  recommendedModels: string[];
  costBand: "low" | "medium" | "high";
  evidenceLevel?: "L0" | "L1" | "L2";
  tags?: string[];
  createdAt?: string;
};

export const creatorAvatarUrls: Record<string, string> = {
  "@umesh_ai": "/media/goodcase/avatars/umesh_ai.jpg",
  "@chetaslua": "/media/goodcase/avatars/chetaslua.jpg",
  "@chesnyfcb": "/media/goodcase/avatars/chesnyfcb.png",
  "@azed_ai": "/media/goodcase/avatars/azed_ai.jpg",
  "@Goodmanprotocol": "/media/goodcase/avatars/goodmanprotocol.jpg",
  "@aimikoda": "/media/goodcase/avatars/aimikoda.jpg",
  "@TechieBySA": "/media/goodcase/avatars/techiebysa.jpg",
  "@LudovicCreator": "/media/goodcase/avatars/ludoviccreator.jpg",
  "@harboriis": "/media/goodcase/avatars/harboriis.jpg",
  "@servasyy_ai": "/media/goodcase/avatars/servasyy_ai.jpg",
  "@viktoroddy": "/media/goodcase/avatars/viktoroddy.jpg",
};

export const caseItems: CaseItem[] = [
  {
    "slug": "real-case-01-umesh-ai",
    "title": "箭矢微观战场（Umesh）",
    "category": "video",
    "source": "X / 𝕏",
    "sourceUrl": "https://x.com/umesh_ai/status/2041746400443298180",
    "sourceLikeCount": 1362,
    "sourceCommentCount": 71,
    "sourceShareCount": 144,
    "sourceSaveCount": 1050,
    "sourcePublishedAt": "2026-04-08T05:14:10.000000Z",
    "sourceMetricsCapturedAt": "2026-07-23T10:14:54.102Z",
    "evidenceLevel": "L1",
    "creator": "@umesh_ai",
    "summary": "镜头跟随离弦箭矢穿越古战场，并持续推近到箭杆表面的微型战争；核心是用同一运动完成宏观战场到微观文明的尺度转换。",
    "promptPreview": "Epic wide-angle shot of a vast ancient battlefield at golden hour, thousands of warriors clashing with swords and shields under a hazy amber sky thick with smoke and ash. A lone ar...",
    "promptFull": "Epic wide-angle shot of a vast ancient battlefield at golden hour, thousands of warriors clashing with swords and shields under a hazy amber sky thick with smoke and ash. A lone archer in weathered bronze armor, face streaked with dirt, draws a longbow with deliberate tension. The arrow releases with a sharp twang. Camera immediately snaps behind the arrow, tracking it in extreme slow motion as it cuts through drifting smoke and falling embers. Shallow depth of field keeps the arrow razor-sharp while the chaotic battlefield blurs behind. The camera pushes closer, tighter, until the wooden shaft fills the frame—revealing intricate carved runes and weathered grain. Seamless transition to macro scale: the arrow's surface becomes a landscape. A microscopic civilization of tiny warriors the size of splinters wages war across the fletching. Miniature catapults hurl fragments of dust. Warriors scale the carved runes like canyon walls. Torches flicker. Banners wave.",
    "promptTranslationZh": "史诗级广角镜头：金色时刻的辽阔古代战场，数千名战士在烟尘与灰烬弥漫的琥珀色天空下持剑盾厮杀。一名身着风化青铜盔甲的孤独弓箭手，脸上沾满尘土，沉稳地拉满长弓。箭矢伴随清脆弦响射出。镜头立刻来到箭矢后方，以极慢动作跟随它穿过飘散的烟雾和坠落的余烬。浅景深让箭矢保持锐利，混乱战场在后方虚化。镜头不断推近，直到木制箭杆占满画面，显露复杂刻纹和风化木纹。无缝转入微观尺度：箭矢表面变成一片地貌。一支只有木屑大小的微型战士文明在箭羽上交战。微型投石车扬起尘土碎屑。战士们攀爬如峡谷峭壁般的刻纹。火把闪烁，旗帜飘动。",
    "resultBreakdown": [
      "镜头始终追随同一支箭：先穿越战场，再贴近箭杆，最后揭示刻纹上的微型军队与投石车。尺度变化由同一物体和同一运动完成，没有依赖硬切。",
      "飞行主体 → 追踪推近 → 表面纹理铺满画面 → 纹理转成地形 → 微观世界揭示。这条结构可以替换成飞船、昆虫、机械零件等其他载体。",
      "重点检查箭矢方向与外形是否连续、宏观到微观是否无跳变，以及兵人、火把和投石车是否稳定附着在箭杆表面。"
    ],
    "mediaType": "video",
    "mediaUrl": "/media/goodcase/umesh_ai-2041746400443298180-01.mp4",
    "posterUrl": "/media/goodcase/umesh_ai-2041746400443298180-01.jpg",
    "likedCount": 4200,
    "remakeCount": 1280,
    "stabilityScore": 91,
    "favoriteScore": 96,
    "recommendedModels": [
      "Veo",
      "Kling"
    ],
    "costBand": "high"
  },
  {
    "slug": "real-case-02-chetaslua",
    "title": "教授授课",
    "category": "video",
    "source": "X / 𝕏",
    "sourceUrl": "https://x.com/chetaslua/status/2053824398503678108",
    "sourceLikeCount": 6244,
    "sourceCommentCount": 354,
    "sourceShareCount": 844,
    "sourceSaveCount": 3039,
    "sourcePublishedAt": "2026-05-11T13:07:49.000000Z",
    "sourceMetricsCapturedAt": "2026-07-23T10:14:54.102Z",
    "evidenceLevel": "L1",
    "creator": "@chetaslua",
    "summary": "来自 X / 𝕏 的真实 视频 案例，由 @chetaslua 发布。适合观察 Prompt 结构、素材组织和可复用的创作模式。",
    "promptPreview": "A professor writes out a mathematical proof for trigonometric identities on a traditional chalkboard, explaining the step he is currently on in the equation.",
    "promptFull": "A professor writes out a mathematical proof for trigonometric identities on a traditional chalkboard, explaining the step he is currently on in the equation.",
    "mediaType": "image",
    "mediaUrl": "/media/goodcase/chetaslua-2053824398503678108-01.jpg",
    "likedCount": 3990,
    "remakeCount": 1222,
    "stabilityScore": 90,
    "favoriteScore": 95,
    "recommendedModels": [
      "Veo",
      "Kling"
    ],
    "costBand": "high"
  },
  {
    "slug": "real-case-03-chesnyfcb",
    "title": "水彩泼墨风格运动员体育海报",
    "category": "image",
    "source": "X / 𝕏",
    "sourceUrl": "https://x.com/chesny/status/2055716498367222213",
    "sourceLikeCount": 213,
    "sourceCommentCount": 9,
    "sourceShareCount": 17,
    "sourceSaveCount": 209,
    "sourcePublishedAt": "2026-05-16T18:26:21.000000Z",
    "sourceMetricsCapturedAt": "2026-07-23T10:14:54.102Z",
    "evidenceLevel": "L1",
    "creator": "@chesnyfcb",
    "summary": "来自 X / 𝕏 的真实 图像 案例，由 @chesnyfcb 发布。适合观察 Prompt 结构、素材组织和可复用的创作模式。",
    "promptPreview": "Create a hyper-detailed artistic sports poster in a sketch + watercolor splash style. Subject: [type here] wearing national team jersey ([number]), athletic build, sharp facial fea...",
    "promptFull": "Create a hyper-detailed artistic sports poster in a sketch + watercolor splash style.\nSubject:\n[type here] wearing national team jersey ([number]), athletic build, sharp facial features, styled hair. Expression intense and focused, looking slightly upward or to the side.\nPose & Composition:\nHalf-body portrait (chest-up)\nSlight diagonal angle for dynamic motion\nOne hand in action (grip / relaxed / flexed based on sport)\nStrong, confident posture\nArt Style:\nHand-drawn ink sketch lines mixed with watercolor textures\nPaint splashes, ink drops, abstract brush strokes\nRough, energetic strokes around body\nRealistic face detailing with slight gritty texture\nBackground:\nClean white background\nAbstract splashes based on team colors\nBalanced chaos, not too cluttered\nTypography Elements:\nText: “[type here]” in bold handwritten style\nJersey number “[number]”\nMotivational line: “[type here]”\nSmall crown or graphic doodles\nExtra Details:\nSubtle gold accents\nSignature-style text at bottom: “[type here]”\nLight grunge texture overlay\nMood:\nPowerful, iconic, poster-worthy.",
    "mediaType": "image",
    "mediaUrl": "/media/goodcase/chesnyfcb-2055716498367222213-02.jpg",
    "likedCount": 3780,
    "remakeCount": 1164,
    "stabilityScore": 92,
    "favoriteScore": 94,
    "recommendedModels": [
      "GPT Image",
      "Gemini Flash Image",
      "Qwen Image"
    ],
    "costBand": "medium"
  },
  {
    "slug": "real-case-04-azed-ai",
    "title": "半透明玻璃水果",
    "category": "image",
    "source": "X / 𝕏",
    "sourceUrl": "https://x.com/azed_ai/status/2055649770199503046",
    "sourceLikeCount": 93,
    "sourceCommentCount": 7,
    "sourceShareCount": 13,
    "sourceSaveCount": 46,
    "sourcePublishedAt": "2026-05-16T14:01:11.000000Z",
    "sourceMetricsCapturedAt": "2026-07-23T10:14:54.102Z",
    "evidenceLevel": "L1",
    "creator": "@azed_ai",
    "summary": "来自 X / 𝕏 的真实 图像 案例，由 @azed_ai 发布。适合观察 Prompt 结构、素材组织和可复用的创作模式。",
    "promptPreview": "Hyper-realistic translucent glass [fruit name], sculpted entirely from clear tinted glass, smooth rounded surface with internal micro air bubbles suspended inside, crystal-like mat...",
    "promptFull": "Hyper-realistic translucent glass [fruit name], sculpted entirely from clear tinted glass, smooth rounded surface with internal micro air bubbles suspended inside, crystal-like material thickness with realistic light refraction, highly polished glossy finish, sharp studio lighting creating strong specular highlights and crisp reflections, placed on a pure white background, minimal composition, soft natural contact shadow beneath, ultra-detailed macro photography, photorealistic 3D render style, clean luxury product aesthetic, high clarity, no props, no color background, white background only",
    "mediaType": "image",
    "mediaUrl": "/media/goodcase/azed_ai-2055649770199503046-01.jpg",
    "likedCount": 3570,
    "remakeCount": 1106,
    "stabilityScore": 91,
    "favoriteScore": 93,
    "recommendedModels": [
      "GPT Image",
      "Gemini Flash Image",
      "Qwen Image"
    ],
    "costBand": "medium"
  },
  {
    "slug": "real-case-05-goodmanprotocol",
    "title": "复古旅行海报拼贴",
    "category": "image",
    "source": "X / 𝕏",
    "sourceUrl": "https://x.com/Goodmanprotocol/status/2055882758845878709",
    "sourceLikeCount": 162,
    "sourceCommentCount": 24,
    "sourceShareCount": 14,
    "sourceSaveCount": 119,
    "sourcePublishedAt": "2026-05-17T05:27:00.000000Z",
    "sourceMetricsCapturedAt": "2026-07-23T10:14:54.102Z",
    "evidenceLevel": "L1",
    "creator": "@Goodmanprotocol",
    "summary": "来自 X / 𝕏 的真实 图像 案例，由 @Goodmanprotocol 发布。适合观察 Prompt 结构、素材组织和可复用的创作模式。",
    "promptPreview": "Generate a retro travel poster collage style main visual for \"[Country Name] TRAVEL POSTERS\". Overall Layout: Antique beige paper background Large, bold country names at the top (e...",
    "promptFull": "Generate a retro travel poster collage style main visual for \"[Country Name] TRAVEL POSTERS\".\n\nOverall Layout:\n\nAntique beige paper background\n\nLarge, bold country names at the top (e.g., JAPAN / ITALY / FRANCE)\n\nCentral Subheading:\n\n“TRAVEL POSTERS FROM AROUND THE WORLD.”\n\n“CREATED ENTIRELY WITH CHATGPT USING JUST ONE PROMPT.”\n\nBottom: 2x3 six-grid poster layout\n\nEach grid represents a different city/region\n\nThin white borders between posters\n\nOverall resembling a high-end retro travel magazine cover + Midcentury travel poster design\n\nVisual Style:\n\nScandinavian Travel Poster\n\nMidcentury Modern\n\nVintage Editorial Design\n\nRetro Tourism Advertisement\n\nHigh-end minimalist typography\n\nWarm golden sunset lighting\n\nAntique printing texture\n\nCinematic lighting\n\nNo cartoonish feel\n\nHigh resolution\n\nExquisite details\n\nSoft retro color tones (beige, caramel, amber gold, dark brown)\n\nTypography heavy design\n\nCinematic composition\n\nPoster layout Aesthetic\n\nEach poster panel must include:\n\nCity name in English (extra large font)\n\nCountry name\n\nSmall slogan\n\nCoordinate numbers\n\nMinimalist icon\n\nRepresentative local landmark\n\nRetro travel poster composition\n\nPlease generate the following six city themes:\n\n1. [City 1] — [Representative attractions/atmosphere]\n\n2. [City 2] — [Representative attractions/atmosphere]\n\n3. [City 3] — [Representative attractions/atmosphere]\n\n4. [City 4] — [Representative attractions/atmosphere]\n\n5. [City 5] — [Representative attractions/atmosphere]\n\n6. [City 6] — [Representative attractions/atmosphere]\n\nAll text must be in English.\n\nThe overall style should resemble:\nhighend vintage travel advertisement poster,\neditorial layout design,\nretro tourism campaign,\nluxury magazine aesthetic,\nwarm cinematic sunset lighting,\nultra detailed,\n8k,\nclean typography,\nmuseum poster quality.",
    "mediaType": "image",
    "mediaUrl": "/media/goodcase/Goodmanprotocol-2055882758845878709-04.jpg",
    "likedCount": 3360,
    "remakeCount": 1048,
    "stabilityScore": 90,
    "favoriteScore": 92,
    "recommendedModels": [
      "GPT Image",
      "Gemini Flash Image",
      "Qwen Image"
    ],
    "costBand": "medium"
  },
  {
    "slug": "real-case-06-aimikoda",
    "title": "梅林元素功夫表演",
    "category": "video",
    "source": "X / 𝕏",
    "sourceUrl": "https://x.com/aimikoda/status/2054460932068200517",
    "sourceLikeCount": 1264,
    "sourceCommentCount": 53,
    "sourceShareCount": 161,
    "sourceSaveCount": 1115,
    "sourcePublishedAt": "2026-05-13T07:17:10.000000Z",
    "sourceMetricsCapturedAt": "2026-07-23T10:14:54.102Z",
    "evidenceLevel": "L1",
    "creator": "@aimikoda",
    "summary": "来自 X / 𝕏 的真实 视频 案例，由 @aimikoda 发布。适合观察 Prompt 结构、素材组织和可复用的创作模式。",
    "promptPreview": "GPT Image 2 Prompt: Create a raw kung fu performance storyboard focused on extreme physical action. Use reference image for the character. 16:9 storyboard sheet, 12 cinematic panel...",
    "promptFull": "GPT Image 2 Prompt:\n\nCreate a raw kung fu performance storyboard focused on extreme physical action. Use reference image for the character.\n\n16:9 storyboard sheet, 12 cinematic panels. The actual storyboard drawings must be black and white only: rough pencil lines, minimal detail, fast gesture drawing energy, simple anatomy construction and strong silhouette readability. Keep the artwork lightweight, dynamic and unfinished like early fight choreography previs.\n\nStart directly in action. Do not begin with a calm stance, preparation shot or slow introduction.\n\nA solitary female performer executes an aggressive Tibetan kung fu master-style routine inside a vast ancient temple. The choreography is exaggerated, explosive and constantly escalating: flying diagonal kicks, monk-style low stances, rapid palm strikes, spinning cloth-like body turns, animal-form hand shapes, deep lunges, aerial twists, floor-level sweeps, sudden drops, claw-like blocks, back-arched jumps, sliding recoveries and violent sculptural impact poses.\n\nEvery panel must contain visible motion and strong body momentum. Avoid static standing poses. The performer should feel like a ritual warrior moving with discipline, fury, spiritual pressure and total body control.\n\nAction progression:\n1. begin mid-air with a flying diagonal kick already in motion\n2. handheld close-up palm sweep cutting through air\n3. orbiting wide shot of a full-body spin\n4. low-angle impact palm strike with shockwave\n5. long-lens side profile spinning kick\n6. top-down aerial turn with body, hair and fabric flaring outward\n7. hard floor stomp cracking the temple stone\n8. sliding low sweep across the floor\n9. aggressive close-up flurry of elbows, palms and backfist strikes\n10. extreme low monk-style beast stance with energy rising\n11. spinning elemental vortex around the body\n12. final airborne action pose, suspended above the temple floor, body twisted in a powerful kung fu strike, all elements converging around her before impact\n\nAdd selective elemental energy effects as VFX-style storyboard accents. The effects should feel spiritual, ritualistic and cinematic, not superhero-like:\nair bursts around spins and flying kicks,\ndust and stone fragments lifting from stomps,\nwater-like floor ripples during slides,\nfire-like trails around explosive strikes,\nheat distortion around high-intensity movement,\nelemental vortex near the climax.\n\nElement progression:\nearly panels: subtle wind, dust and pressure lines\nmiddle panels: stronger stone fragments, floor ripples and air shockwaves\nlate panels: controlled fire trails and energy spirals\nfinal panel: the strongest combined elemental surge while the performer is still airborne\n\nUse cinematic arthouse action camerawork:\nhandheld energy,\nwhip-pan feeling,\norbiting camera moves,\noverhead shots,\nside silhouettes,\naggressive close-ups,\nlong-lens compression,\nextreme low angles,\nwide negative space,\nstrong parallax.\n\nKeep the temple environment minimal and atmospheric:\ntowering stone columns,\nworn temple floor,\ndrifting incense smoke,\nhanging fabric,\nharsh light shafts,\nfaint dust in the air,\nsubtle wet floor reflections.\nDo not overcrowd the frames.\n\nAnnotation color system:\nred arrows = body movement\nblue arrows = camera movement\ngreen marks = framing / composition notes\norange marks = lighting direction\nyellow marks = elemental VFX / energy effects\nblack text = short lens notes and panel labels\n\nNo timestamps. No dialogue. No singing. No extra characters. No enemies. No logos. No watermark.\n\n\nSeedance 2.0 Prompt:\n\nCreate a 15-second cinematic kung fu performance video.\n\nUse @[image1]  as the fixed character sheet reference. The character must strictly match the character sheet.\nUse @[image2]  as the storyboard reference.\n\nFollow the storyboard shot by shot as the main source for action order, camera rhythm, body movement, framing, movement direction, camera angles and visual progression. Treat each storyboard panel as a sequential keyframe. Preserve the shot order and make the video feel like the storyboard has been translated into continuous live-action motion. The sequence must end on a frozen final frame while the performer is still airborne.\n\nDo not add text, captions, storyboard labels, arrows, UI, logos or watermarks. Do not treat the storyboard as a single image. Do not redesign the character, change the costume or alter the face. Do not begin with a calm stance, preparation pose or slow introduction. Do not make the elemental effects look like superhero powers or excessive fantasy glow.\n\nVisual style:\nstylized cinematic realism, high-end 3D painterly animation quality, dynamic cloth simulation, expressive silhouette design, rich cinematic lighting, controlled color palette, natural motion blur, dramatic scale, beautiful but aggressive physicality, premium feature-animation aesthetic.\n\nEnvironment:\nvast ancient temple, towering stone columns, worn temple floor, drifting incense smoke, hanging fabric, harsh light shafts, faint dust in the air, subtle wet floor reflections, high contrast shadows.\n\nThe performance is a solitary female kung fu routine inside a vast ancient temple. The routine starts immediately in action, with no calm stance, no preparation pose and no slow introduction. The movement should feel aggressive, ritualistic, disciplined, physically extreme and spiritually charged.\n\nThis is not a fight against an enemy. It is a solo performance of force, control, exhaustion, fury and release.\n\nFollow story board for choreography direction.\n\nElement progression:\nearly sequence: subtle wind, dust and pressure lines responding to movement.\nmiddle sequence: stronger air shockwaves, stone fragments, floor cracks and water-like ripples across the temple floor.\nlate sequence: controlled fire trails, heat distortion and energy spirals around explosive strikes and kicks.\nclimax: wind, dust, stone, water ripple and fire accents combine into a stronger elemental vortex.\nfinal beat: the performer is airborne above the temple floor in a powerful kung fu strike, body twisted mid-air, hair and fabric flaring outward, with all elements converging around her before impact.\n\nElemental VFX must feel spiritual, ritualistic and cinematic. The effects should be integrated with the choreography and motivated by physical movement. Keep the energy raw, elemental, atmospheric and grounded in the temple environment.\n\nUse Laban movement logic throughout:\nweight: strong, heavy, grounded during impacts, with brief lightness during jumps and aerial twists\ntime: quick during strikes, kicks, drops and turns, sustained during suspended holds and recovery transitions\nspace: direct during attacks, blocks and lunges, indirect during spinning turns and elemental vortex moments\nflow: bound during rooted stances and precise strikes, free during aerial motion, spinning fabric movement and elemental release",
    "mediaType": "video",
    "mediaUrl": "/media/goodcase/aimikoda-2054460932068200517-01.mp4",
    "posterUrl": "/media/goodcase/aimikoda-2054460932068200517-01.jpg",
    "likedCount": 3150,
    "remakeCount": 990,
    "stabilityScore": 86,
    "favoriteScore": 91,
    "recommendedModels": [
      "Seedance 2.0",
      "Veo",
      "Kling"
    ],
    "costBand": "high"
  },
  {
    "slug": "real-case-07-techiebysa",
    "title": "法式牛角包制作过程",
    "category": "video",
    "source": "X / 𝕏",
    "sourceUrl": "https://x.com/TechieBySA/status/2053523775702925768",
    "sourceLikeCount": 494,
    "sourceCommentCount": 33,
    "sourceShareCount": 67,
    "sourceSaveCount": 438,
    "sourcePublishedAt": "2026-05-10T17:13:15.000000Z",
    "sourceMetricsCapturedAt": "2026-07-23T10:14:54.102Z",
    "evidenceLevel": "L1",
    "creator": "@TechieBySA",
    "summary": "来自 X / 𝕏 的真实 视频 案例，由 @TechieBySA 发布。适合观察 Prompt 结构、素材组织和可复用的创作模式。",
    "promptPreview": "GPT Image 2 Storyboard prompt: “Create a crisp, clean infographic storyboard poster for THE CROISSANT BAKER. Wide 16:9 layout, white background, black borders, bold black typograph...",
    "promptFull": "GPT Image 2 Storyboard prompt:\n\n“Create a crisp, clean infographic storyboard poster for THE CROISSANT BAKER. Wide 16:9 layout, white background, black borders, bold black typography, premium Pixar 3D stylized rendering, bright vivid colors — warm golden yellows, rich buttery creams, flaky browns, soft pastry whites, warm French bakery morning light.\nTop header:\n\nTHE CROISSANT BAKER\nTOTAL VIDEO TIME: 12 SECONDS\n8 SHOTS · WARM · FLAKY · IRRESISTIBLE\nLegend icons: ACTION, HEAT, TIME HINT, INGREDIENT\nThin warm golden accent line running full width beneath header\n\nSame Pixar-style young French male baker throughout: white baker's jacket, flour-dusted hands, warm authentic French boulangerie setting, marble countertop, warm morning light streaming through windows, bread racks in background. Bright, warm, delicious. Every panel a completely different composition and color.\n8 panels:\n\nTHE OPENER — Wide shot of baker arriving at the boulangerie before dawn, tying apron, switching on the warm kitchen lights, marble counter visible, bread racks behind, flour dusting the air, full world established, bright and cinematic\nTHE BUTTER BLOCK — Baker slams a massive cold block of European butter onto the marble counter with both hands, dramatic impact, flour cloud puffing up, close-up on hands, this is the bones moment — the start of everything\nTHE LAMINATION — Baker folding the dough over the butter block precisely, rolling pin pressing down hard, layers building, side angle shot showing the beautiful layering beginning, confident and skilled\nTHE ROLL — Dough rolled out into a large thin sheet, baker leaning into the rolling pin with full body weight, marble counter, flour dusting everywhere, wide shot showing the scale of the dough\nTHE SHAPE — Triangles cut from the dough, baker rolling each one from the wide end into a tight crescent, hands moving fast and confident, close-up on the shaping, beautiful and precise\nTHE EGG WASH — Baker brushing golden egg wash over each shaped croissant with a pastry brush, each one glistening beautifully, close-up overhead angle, warm golden color, stunning composition\nTHE OVEN — Croissants slid into the blazing hot oven on a tray, oven door closed, through the oven glass croissants visibly puffing and turning deep golden, layers separating dramatically, warm orange glow\nTHE TEAR — Baker pulls a perfect golden croissant from the rack, holds it up, tears it open slowly revealing hundreds of impossibly flaky buttery layers inside, steam escaping, butter glistening — this is the cheese pull moment, the hero shot of the entire video\n\nFooter:\n\nVIDEO FLOW: 8 shots × 1.5s = 12 seconds. Butter block to the tear.\nCAMERA TIPS: wide on opener, close-up on butter slam and shaping, side angle on lamination, overhead on egg wash, oven glass for panel 7, extreme close-up on the tear reveal\nLIGHT & STYLE: warm golden French bakery morning light, buttery cream tones, flour dust in the air, bright vivid Pixar colors, shallow depth of field on close-ups\nBAKER NOTES: one baker, one perfect croissant, one irresistible tear. The lamination layers and the final tear are everything — make them stunning.”\n\nSeedance 2.0 prompt:\n\n“Use the attached THE CROISSANT BAKER storyboard image as the exact reference.\nCreate a 12-second 16:9 animated croissant-making sequence that follows the 8-shot storyboard exactly. Preserve the same Pixar-style young French male baker, white jacket, flour-dusted hands, warm authentic French boulangerie, marble counter, and bright golden color aesthetic throughout.\nRules:\n•Follow the sequence exactly from 1 to 8\n•One shot per panel, approximately 1.5 seconds each\n•No skipped steps, no extra steps beyond the storyboard\n•Maintain character and bakery continuity throughout\n•Emphasize the butter slam, lamination layers, crescent shaping, egg wash glisten, oven puff, and final flaky tear reveal\nShot sequence:\n1.Baker arrives before dawn, ties apron, switches on warm kitchen lights — wide establishing shot, full boulangerie world visible\n2.Massive cold butter block slammed onto marble counter — dramatic impact, flour cloud explosion, close-up hands only\n3.Dough folded precisely over butter, rolling pin pressing down hard — side angle, beautiful layers building\n4.Dough rolled into large thin sheet — baker leaning into rolling pin with full body weight, flour dusting everywhere\n5.Triangles cut and rolled into tight crescents — hands moving fast and confident, close-up on shaping\n6.Golden egg wash brushed over each croissant — pastry brush close-up, each one glistening, overhead angle\n7.Croissants in blazing oven — through oven glass puffing dramatically, turning deep golden, layers separating, warm orange glow\n8.Baker tears open a perfect golden croissant — hundreds of flaky buttery layers revealed, steam escaping, butter glistening, pure satisfaction\nCamera:\n•Wide establishing shot for the opener\n•Close-up hands only for butter slam and crescent shaping\n•Side angle for the lamination\n•Wide shot for the dough roll\n•Overhead for the egg wash\n•Oven glass shot for panel 7\n•Extreme close-up hero shot for the final tear\nStyle:\n•Warm golden French bakery morning light throughout\n•Buttery cream tones, flour dust particles in the air, marble counter\n•Pixar CGI vivid expressive animation\n•Shallow depth of field on close-up shots\n•Smooth satisfying cuts, warm and joyful energy throughout\nGoal: A mouth-watering 12-second croissant journey from butter block to flaky tear — warm, golden, layered, and impossible to scroll past.“",
    "mediaType": "image",
    "mediaUrl": "/media/goodcase/TechieBySA-2053523775702925768-01.jpg",
    "likedCount": 2940,
    "remakeCount": 932,
    "stabilityScore": 85,
    "favoriteScore": 90,
    "recommendedModels": [
      "Seedance 2.0",
      "Veo",
      "Kling"
    ],
    "costBand": "high"
  },
  {
    "slug": "real-case-08-ludoviccreator",
    "title": "空旷平原日出瞬间城市自建",
    "category": "video",
    "source": "X / 𝕏",
    "sourceUrl": "https://x.com/LudovicCreator/status/2055351279170318782",
    "sourceLikeCount": 55,
    "sourceCommentCount": 6,
    "sourceShareCount": 9,
    "sourceSaveCount": 26,
    "sourcePublishedAt": "2026-05-15T18:15:06.000000Z",
    "sourceMetricsCapturedAt": "2026-07-23T10:14:54.102Z",
    "evidenceLevel": "L1",
    "creator": "@LudovicCreator",
    "summary": "来自 X / 𝕏 的真实 视频 案例，由 @LudovicCreator 发布。适合观察 Prompt 结构、素材组织和可复用的创作模式。",
    "promptPreview": "A completely empty flat landscape at sunrise. At the 2-second mark, buildings begin assembling themselves ,steel beams flying into place, glass panels snapping together, roads draw...",
    "promptFull": "A completely empty flat landscape at sunrise.\n\nAt the 2-second mark, buildings begin assembling themselves ,steel beams flying into place, glass panels snapping together, roads drawing themselves across the ground.\n\nThe camera moves forward as the city constructs itself in real-time.\n\nVehicles appear mid-motion, lights turning on as systems activate.\n\nVelocity ramp: a skyscraper forms directly around the camera , floors stacking upward.\n\nFinal moment: the city is complete ,then everything stops suddenly, perfectly still.",
    "mediaType": "video",
    "mediaUrl": "/media/goodcase/LudovicCreator-2055351279170318782-01.mp4",
    "posterUrl": "/media/goodcase/LudovicCreator-2055351279170318782-01.jpg",
    "likedCount": 2730,
    "remakeCount": 874,
    "stabilityScore": 84,
    "favoriteScore": 89,
    "recommendedModels": [
      "Veo",
      "Kling"
    ],
    "costBand": "high"
  },
  {
    "slug": "real-case-09-oggii-0",
    "title": "搞笑丑涂鸦",
    "category": "image",
    "source": "X / 𝕏",
    "sourceUrl": "https://x.com/oggii_0/status/2055125487014564227",
    "sourceLikeCount": 591,
    "sourceCommentCount": 47,
    "sourceShareCount": 69,
    "sourceSaveCount": 522,
    "sourcePublishedAt": "2026-05-15T03:17:53.000Z",
    "sourceMetricsCapturedAt": "2026-07-25T18:02:55.000Z",
    "evidenceLevel": "L1",
    "creator": "@oggii_0",
    "summary": "来自 X / 𝕏 的真实 图像 案例，由 @oggii_0 发布。适合观察 Prompt 结构、素材组织和可复用的创作模式。",
    "promptPreview": "Turn this photo into a funny ugly doodle drawing. Make it look like: a quick sketch using a cheap marker or crayon messy, rough, childlike style bad perspective and awkward proport...",
    "promptFull": "Turn this photo into a funny ugly doodle drawing. Make it look like: a quick sketch using a cheap marker or crayon messy, rough, childlike style bad perspective and awkward proportions slightly exaggerated facial features Add: simple cartoon background (like buildings, trees, street) random sketchy lines and details uneven coloring and visible strokes Style: looks like a lazy drawing, not polished humorous and a bit stupid-looking meme-like, casual, internet style Do NOT: make it realistic",
    "mediaType": "image",
    "mediaUrl": "/media/goodcase/Xnip2026-05-17_17-34-13.jpg",
    "likedCount": 2520,
    "remakeCount": 816,
    "stabilityScore": 86,
    "favoriteScore": 88,
    "recommendedModels": [
      "GPT Image",
      "Gemini Flash Image",
      "Qwen Image"
    ],
    "costBand": "medium"
  },
  {
    "slug": "real-case-10-harboriis",
    "title": "幻想森林肖像",
    "category": "image",
    "source": "X / 𝕏",
    "sourceUrl": "https://x.com/harboriis/status/2055108243438125519",
    "sourceLikeCount": 242,
    "sourceCommentCount": 43,
    "sourceShareCount": 45,
    "sourceSaveCount": 149,
    "sourcePublishedAt": "2026-05-15T02:09:21.000000Z",
    "sourceMetricsCapturedAt": "2026-07-23T10:14:54.102Z",
    "evidenceLevel": "L1",
    "creator": "@harboriis",
    "summary": "来自 X / 𝕏 的真实 图像 案例，由 @harboriis 发布。适合观察 Prompt 结构、素材组织和可复用的创作模式。",
    "promptPreview": "Ultra realistic cinematic portrait of a mysterious young alternative girl sitting in a dark foggy pine forest beside a massive Bengal tiger, emotional moody atmosphere, soft cold c...",
    "promptFull": "Ultra realistic cinematic portrait of a mysterious young alternative girl sitting in a dark foggy pine forest beside a massive Bengal tiger, emotional moody atmosphere, soft cold color grading, deep forest shadows, highly detailed tiger fur texture, realistic human skin pores, melancholic expression, intimate bond between girl and tiger, oversized tiger resting protectively behind her with one giant paw extending forward, girl touching tiger’s face gently, centered symmetrical composition.\n\nThe girl has long messy black hair with soft bangs, pale skin, subtle makeup, tattooed arms and fingers, wearing an oversized black gothic graphic t shirt, loose faded blue baggy jeans, chunky white sneakers, silver rings, relaxed streetwear aesthetic, indie grunge fashion style. She is sitting on giant concrete numbers “1994” carved like stone blocks.\n\nBackground filled with tall dark pine trees, misty atmosphere, cinematic fog, wet forest ground, muted grey and blue tones, dramatic natural lighting, shallow depth of field, ultra detailed eyes, realistic whiskers, atmospheric perspective, emotional dark fantasy realism, luxury editorial photography mixed with wildlife fantasy art.\n\nProfessional fashion photography, ultra sharp focus, 85mm lens, f/1.8 depth of field, volumetric lighting, realistic shadows, desaturated tones, dark moody aesthetic, cinematic composition, high detail texture, photorealistic, masterpiece quality, award winning photography, 8k, ultra realistic, Unreal Engine cinematic render style.",
    "mediaType": "image",
    "mediaUrl": "/media/goodcase/harboriis-2055108243438125519-01.jpg",
    "likedCount": 2310,
    "remakeCount": 758,
    "stabilityScore": 94,
    "favoriteScore": 87,
    "recommendedModels": [
      "GPT Image",
      "Gemini Flash Image",
      "Qwen Image"
    ],
    "costBand": "medium"
  },
  {
    "slug": "real-case-11-servasyy-ai",
    "title": "image to 3D",
    "category": "web",
    "source": "X / 𝕏",
    "sourceUrl": "https://x.com/servasyy_ai/status/2053430277020770561",
    "sourceLikeCount": 3916,
    "sourceCommentCount": 145,
    "sourceShareCount": 604,
    "sourceSaveCount": 5239,
    "sourcePublishedAt": "2026-05-10T11:01:43.000000Z",
    "sourceMetricsCapturedAt": "2026-07-23T10:14:54.102Z",
    "evidenceLevel": "L1",
    "creator": "@servasyy_ai",
    "summary": "来自 X / 𝕏 的真实 编程/UI 案例，由 @servasyy_ai 发布。适合观察 Prompt 结构、素材组织和可复用的创作模式。",
    "promptPreview": "[https://github.com/huangserva/3DCellForge](https://github.com/huangserva/3DCellForge)",
    "promptFull": "[https://github.com/huangserva/3DCellForge](https://github.com/huangserva/3DCellForge)",
    "mediaType": "video",
    "mediaUrl": "/media/goodcase/servasyy_ai-2053430277020770561-01.mp4",
    "posterUrl": "/media/goodcase/servasyy_ai-2053430277020770561-01.jpg",
    "likedCount": 2100,
    "remakeCount": 700,
    "stabilityScore": 93,
    "favoriteScore": 86,
    "recommendedModels": [
      "Claude Sonnet",
      "GPT-5",
      "Gemini Pro"
    ],
    "costBand": "medium"
  },
  {
    "slug": "real-case-12-viktoroddy",
    "title": "应式3D角色轮播动画UI",
    "category": "web",
    "source": "X / 𝕏",
    "sourceUrl": "https://x.com/viktoroddy/status/2054885940183880156",
    "sourceLikeCount": 206,
    "sourceCommentCount": 9,
    "sourceShareCount": 12,
    "sourceSaveCount": 160,
    "sourcePublishedAt": "2026-05-14T11:26:00.000000Z",
    "sourceMetricsCapturedAt": "2026-07-23T10:14:54.102Z",
    "evidenceLevel": "L1",
    "creator": "@viktoroddy",
    "summary": "来自 X / 𝕏 的真实 编程/UI 案例，由 @viktoroddy 发布。适合观察 Prompt 结构、素材组织和可复用的创作模式。",
    "promptPreview": "Access ALL prompts for stunning animated websites in one click: [http://motionsites.ai](https://t.co/N0kni8yzNb) Build a single full-viewport hero section in React + TypeScript + V...",
    "promptFull": "Access ALL prompts for stunning animated websites in one click: [http://motionsites.ai](https://t.co/N0kni8yzNb)\n\nBuild a single full-viewport hero section in React + TypeScript + Vite + Tailwind CSS, using `lucide-react` for icons. The component is a character-figurine carousel called \"TOONHUB\".\n\n**Fonts (load in `index.html` head):**\n```html\n<link rel=\"preconnect\" href=\"[https://fonts.googleapis.com](https://t.co/rsoRTSBepz)\" />\n<link rel=\"preconnect\" href=\"[https://fonts.gstatic.com](https://t.co/VkCjQLvdnP)\" crossorigin />\n<link href=\"[https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap](https://t.co/8t4Kzo1zNL)\" rel=\"stylesheet\" />\n```\nBody font: `'Inter', sans-serif`. Display font (huge ghost text + bottom-right link): `'Anton', sans-serif`.\n\n**Image data (4 items, exact URLs and colors):**\n```ts\nconst IMAGES = [\n  { src: '[https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png](https://t.co/aB5EkurEZm)', bg: '[#F4845F](https://x.com/hashtag/F4845F?src=hashtag_click)', panel: '[#F79B7F](https://x.com/hashtag/F79B7F?src=hashtag_click)' },\n  { src: '[https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png](https://t.co/io6heD3I3x)', bg: '[#6BBF7A](https://x.com/hashtag/6BBF7A?src=hashtag_click)', panel: '[#85CC92](https://x.com/hashtag/85CC92?src=hashtag_click)' },\n  { src: '[https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png](https://t.co/KfUOheLYrG)', bg: '[#E882B4](https://x.com/hashtag/E882B4?src=hashtag_click)', panel: '[#ED9DC4](https://x.com/hashtag/ED9DC4?src=hashtag_click)' },\n  { src: '[https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png](https://t.co/pSSKkvRr4Y)', bg: '[#6EB5FF](https://x.com/hashtag/6EB5FF?src=hashtag_click)', panel: '[#8DC4FF](https://x.com/hashtag/8DC4FF?src=hashtag_click)' },\n];\n```\nPreload all 4 images on mount via `new Image()`.\n\n**State & logic:**\n- `activeIndex` (0–3), `isAnimating` boolean lock, `isMobile` (`window.innerWidth < 640`, updated on resize).\n- `navigate('next' | 'prev')`: ignore if animating; set `isAnimating=true`; bump `activeIndex` `(prev+1)%4` or `(prev+3)%4`; release lock after `650ms`.\n- Roles derived from activeIndex: `center=activeIndex`, `left=(activeIndex+3)%4`, `right=(activeIndex+1)%4`, `back=(activeIndex+2)%4`.\n\n**Layout structure:**\nOuter `<div>` has `backgroundColor: IMAGES[activeIndex].bg`, transition `background-color 650ms cubic-bezier(0.4,0,0.2,1)`, `fontFamily: 'Inter, sans-serif'`, `relative w-full overflow-hidden`. Inside, a `relative w-full` div with `height: 100vh; overflow: hidden`.\n\n1. **Grain overlay** (`absolute inset-0 pointer-events-none`, zIndex 50): SVG fractalNoise data URI, `baseFrequency=0.9`, `numOctaves=4`, opacity 0.08 inside SVG, container `opacity: 0.4`, `backgroundSize: 200px 200px`, repeat.\n\n2. **Giant ghost text \"3D SHAPE\"** (`absolute inset-x-0 flex items-center justify-center pointer-events-none select-none`, zIndex 2, `top: 18%`): font Anton, `fontSize: clamp(90px, 28vw, 380px)`, weight 900, color white, opacity 1, lineHeight 1, uppercase, letterSpacing `-0.02em`, whiteSpace nowrap.\n\n3. **Top-left brand label \"TOONHUB\"** (`absolute top-6 left-4 sm:left-8`, zIndex 60): `text-xs font-semibold uppercase`, white, opacity 0.9, letterSpacing `0.18em`.\n\n4. **Carousel** (`absolute inset-0`, zIndex 3): map all 4 IMAGES; each item is `position:absolute`, `aspectRatio: '0.6 / 1'`, with role-based styles below. Inside, an `<img>` `width:100%; height:100%; objectFit:contain; objectPosition:bottom center; draggable=false`.\n\n   Per-role style:\n   - **center**: `transform: translateX(-50%) scale(${isMobile?1.25:1.68})`, no blur, opacity 1, zIndex 20, `left:50%`, `height: isMobile?'60%':'92%'`, `bottom: isMobile?'22%':0`.\n   - **left**: `translateX(-50%) scale(1)`, blur 2px, opacity 0.85, zIndex 10, `left: isMobile?'20%':'30%'`, `height: isMobile?'16%':'28%'`, `bottom: isMobile?'32%':'12%'`.\n   - **right**: same as left but `left: isMobile?'80%':'70%'`.\n   - **back**: `translateX(-50%) scale(1)`, blur 4px, opacity 1, zIndex 5, `left:50%`, `height: isMobile?'13%':'22%'`, `bottom: isMobile?'32%':'12%'`.\n\n   Transition on each item: `transform 650ms cubic-bezier(0.4,0,0.2,1), filter 650ms ..., opacity 650ms ..., left 650ms ...`. `willChange: transform, filter, opacity`.\n\n5. **Bottom-left text + nav buttons** (`absolute bottom-6 left-4 sm:bottom-20 sm:left-24`, zIndex 60, `maxWidth:320px`):\n   - `<p>` \"TOONHUB FIGURINES\" — bold uppercase, tracking-widest, `mb-2 sm:mb-3 text-base sm:text-[22px]`, white, opacity 0.95, letterSpacing `0.02em`.\n   - `<p>` (hidden on mobile, `hidden sm:block`): \"The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now.\" — `text-xs sm:text-sm`, white, opacity 0.85, lineHeight 1.6, `mb-4 sm:mb-5`.\n   - Two circular buttons (`w-12 h-12 sm:w-16 sm:h-16`, transparent bg, 2px white border, white icon): `ArrowLeft` and `ArrowRight` from lucide-react, size 26, strokeWidth 2.25. On hover: scale 1.08 + bg `rgba(255,255,255,0.12)`. Transition `transform 150ms, background-color 150ms`. Click triggers `navigate('prev')` / `navigate('next')`.\n\n6. **Bottom-right link \"DISCOVER IT\"** (`absolute bottom-6 right-4 sm:bottom-20 sm:right-10`, zIndex 60): `<a>` flex items-center, font Anton, `fontSize: clamp(20px, 4vw, 56px)`, weight 400, white, opacity 0.95→1 on hover (200ms), letterSpacing `-0.02em`, lineHeight 1, uppercase, no underline. Followed by `ArrowRight` (`w-5 h-5 sm:w-8 sm:h-8`, strokeWidth 2.25).\n\n**Behavior summary:** clicking arrows rotates roles; background color, image positions, scales, blurs, and opacities all crossfade simultaneously over 650ms with `cubic-bezier(0.4,0,0.2,1)`. The character images sit at the bottom of the screen overlapping the giant \"3D SHAPE\" text behind them.",
    "mediaType": "video",
    "mediaUrl": "/media/goodcase/viktoroddy-2054885940183880156-01.mp4",
    "posterUrl": "/media/goodcase/viktoroddy-2054885940183880156-01.jpg",
    "likedCount": 1890,
    "remakeCount": 642,
    "stabilityScore": 92,
    "favoriteScore": 85,
    "recommendedModels": [
      "Claude Sonnet",
      "GPT-5",
      "Gemini Pro"
    ],
    "costBand": "medium"
  }
];

export const favoriteLeaderboard = [...caseItems]
  .sort((a, b) => b.favoriteScore - a.favoriteScore)
  .slice(0, 3);

export const stabilityLeaderboard = [...caseItems]
  .sort((a, b) => b.stabilityScore - a.stabilityScore)
  .slice(0, 3);

export const roadmapItems = [
  "继续从飞书多维表补充 20 到 30 个真实案例，优先完善图像和视频样本。",
  "把当前 Beta 派生分数逐步替换为真实传播、喜爱和复现实验数据。",
  "登录、点赞、复制 Prompt 和收藏行为统一写入用户事件表。",
  "媒体素材先走本地发布资产，后续流量放大时再切 R2 或 Supabase Storage。",
];
