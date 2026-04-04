'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import kidsApi from '@/lib/kids-api';

interface ChallengeData {
  id: number;
  title: string;
  description: string;
  instructions: string;
  difficulty: string;
  challenge_type: string;
  points: number;
  icon_emoji: string;
  hints: string[];
  toolbox_json: Record<string, unknown>;
  starter_workspace_json: Record<string, unknown>;
  stage_config: Record<string, unknown>;
  expected_output: Record<string, unknown>;
  lesson_title: string;
  course_title: string;
}

interface RunResult {
  blocksUsed: string[];
  blockCount: number;
  actionsPerformed: string[];
  terminalOutput: string[];
  webElements: string[];
  reachedGoal: boolean;
  collectedCount: number;
  arcsDrawn: number;
  linesDrawn: number;
  colorsUsed: Set<string>;
  hasScoring: boolean;
  hasGameOver: boolean;
  usesVariable: boolean;
  usesInput: boolean;
  usesIf: boolean;
  usesLoop: boolean;
  printsGreeting: boolean;
  hasHeading: boolean;
  hasParagraph: boolean;
  hasList: boolean;
  charactersAnimated: number;
  danceCount: number;
}

interface RobotState {
  x: number;
  y: number;
  direction: number;
}

const GRID_SIZE = 40;
const STAGE_W = 400;
const STAGE_H = 300;

type StageType = 'console' | 'drawing' | 'platformer' | 'game' | 'maze' | 'web_preview' | 'default';

function getStageType(challenge: ChallengeData): StageType {
  const config = (challenge.stage_config || {}) as Record<string, unknown>;
  const t = config.type as string | undefined;
  if (t === 'console' || t === 'drawing' || t === 'platformer' || t === 'game' || t === 'maze' || t === 'web_preview') return t;
  return 'default';
}

export default function LearnPage() {
  const params = useParams();
  const challengeId = params.challengeId as string;
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const terminalLinesRef = useRef<string[]>([]);
  const [webPreviewHtml, setWebPreviewHtml] = useState<string[]>([]);
  const [blocklyReady, setBlocklyReady] = useState(false);
  const [validated, setValidated] = useState(false);
  const runResultRef = useRef<RunResult>({
    blocksUsed: [], blockCount: 0, actionsPerformed: [], terminalOutput: [], webElements: [],
    reachedGoal: false, collectedCount: 0, arcsDrawn: 0, linesDrawn: 0, colorsUsed: new Set(),
    hasScoring: false, hasGameOver: false, usesVariable: false, usesInput: false, usesIf: false,
    usesLoop: false, printsGreeting: false, hasHeading: false, hasParagraph: false, hasList: false,
    charactersAnimated: 0, danceCount: 0,
  });
  const blocklyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workspaceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pixiAppRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const robotSpriteRef = useRef<any>(null);
  const robotStateRef = useRef<RobotState>({ x: 60, y: 60, direction: 0 });
  const drawColorRef = useRef<number>(0xFF0000);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocklyModuleRef = useRef<any>(null);
  const [availableBlocks, setAvailableBlocks] = useState<{type: string; label: string; colour: string}[]>([]);
  const [showMobileBlocks, setShowMobileBlocks] = useState(false);
  const [categories, setCategories] = useState<{name: string; colour: string; contents: unknown[]; custom?: string}[]>([]);
  const [activeCategory, setActiveCategory] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    kidsApi.getChallenge(parseInt(challengeId)).then(data => {
      setChallenge(data);
      setLoading(false);
    }).catch((err) => {
      console.error('Failed to load challenge:', err);
      setError('Challenge not found');
      setLoading(false);
    });
  }, [challengeId]);

  // Initialize Blockly
  useEffect(() => {
    if (!challenge || !blocklyRef.current || blocklyReady) return;
    let cancelled = false;

    const initBlockly = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Blockly = await import('blockly') as any;
        blocklyModuleRef.current = Blockly;
        if (cancelled || !blocklyRef.current) return;

        // Only define kid-specific custom blocks — NOT standard Blockly ones
        // Standard blocks (text_print, text, variables_set, controls_if, etc.) are built-in
        const kidOnlyBlocks = [
          { type: 'move_forward', message0: '➡️ Move Forward', colour: 160 },
          { type: 'move_left', message0: '⬅️ Move Left', colour: 160 },
          { type: 'move_right', message0: '➡️ Move Right', colour: 160 },
          { type: 'move_up', message0: '⬆️ Move Up', colour: 160 },
          { type: 'move_down', message0: '⬇️ Move Down', colour: 160 },
          { type: 'turn_right', message0: '🔄 Turn Right', colour: 210 },
          { type: 'turn_left', message0: '↩️ Turn Left', colour: 210 },
          { type: 'jump', message0: '⬆️ Jump!', colour: 65 },
          { type: 'dance', message0: '💃 Dance!', colour: 330 },
          { type: 'say_hello', message0: '👋 Wave Hello', colour: 20 },
          { type: 'collect', message0: '🎒 Collect', colour: 45 },
          { type: 'when_space_pressed', message0: '⌨️ When Space Pressed', colour: 290 },
          { type: 'when_arrow_left', message0: '⬅️ When Left Arrow', colour: 290 },
          { type: 'when_arrow_right', message0: '➡️ When Right Arrow', colour: 290 },
          { type: 'when_start', message0: '🟢 When Start', colour: 290 },
          { type: 'create_star', message0: '⭐ Create Star', colour: 45 },
          { type: 'create_asteroid', message0: '☄️ Create Asteroid', colour: 0 },
          { type: 'if_touching', message0: '🤝 If Touching Player', colour: 210 },
          { type: 'add_score', message0: '🏆 +1 Score', colour: 45 },
          { type: 'game_over', message0: '💥 Game Over', colour: 0 },
          { type: 'forever_loop', message0: '🔁 Forever', colour: 120 },
          { type: 'set_color', message0: '🎨 Set Color', colour: 330 },
          { type: 'draw_arc', message0: '⭕ Draw Arc', colour: 160 },
          { type: 'draw_line', message0: '📏 Draw Line', colour: 160 },
        ];

        // Import ALL Blockly plugins — full ecosystem
        let FieldColour: unknown = null;
        let ScrollOptions: unknown = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const plugins: Record<string, any> = {};

        // Field plugins
        try { const m = await import('@blockly/field-colour'); FieldColour = m.FieldColour; plugins.FieldColour = m.FieldColour; } catch { /* optional */ }
        try { const m = await import('@blockly/field-angle'); plugins.FieldAngle = m.FieldAngle; } catch { /* optional */ }
        try { const m = await import('@blockly/field-slider'); plugins.FieldSlider = m.FieldSlider; } catch { /* optional */ }
        try { const m = await import('@blockly/field-grid-dropdown'); plugins.FieldGridDropdown = m.FieldGridDropdown; } catch { /* optional */ }
        try { const m = await import('@blockly/field-multilineinput'); plugins.FieldMultilineInput = m.FieldMultilineInput; } catch { /* optional */ }
        try { const m = await import('@blockly/field-bitmap'); plugins.FieldBitmap = m.FieldBitmap; } catch { /* optional */ }
        // Workspace plugins
        try { const m = await import('@blockly/plugin-scroll-options'); ScrollOptions = m.ScrollOptions; plugins.ScrollOptions = m.ScrollOptions; } catch { /* optional */ }
        try { const m = await import('@blockly/plugin-workspace-search'); plugins.WorkspaceSearch = m.WorkspaceSearch; } catch { /* optional */ }
        try { const m = await import('@blockly/zoom-to-fit'); plugins.ZoomToFitControl = m.ZoomToFitControl; } catch { /* optional */ }
        try { const m = await import('@blockly/plugin-cross-tab-copy-paste'); plugins.CrossTabCopyPaste = m.CrossTabCopyPaste; } catch { /* optional */ }
        try { const m = await import('@blockly/shadow-block-converter'); plugins.ShadowBlockConverter = m; } catch { /* optional */ }
        // Block plugins
        // @ts-expect-error — no type declarations for block-plus-minus
        try { await import('@blockly/block-plus-minus'); } catch { /* optional — auto-registers */ }
        console.log('✅ Blockly plugins loaded:', Object.keys(plugins).join(', '));

        // Special block: set_color with color picker
        if (!Blockly.Blocks['set_color']) {
          Blockly.Blocks['set_color'] = {
            init: function() {
              const input = this.appendDummyInput().appendField('🎨 Color');
              if (FieldColour) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                input.appendField(new (FieldColour as any)('#FF0000', undefined, {
                  colourOptions: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3',
                                  '#FF69B4', '#00CED1', '#FFD700', '#8B4513', '#FFFFFF', '#000000'],
                  columns: 7,
                }), 'COLOR');
              } else {
                input.appendField(new Blockly.FieldDropdown([
                  ['🔴 Red', '#FF0000'], ['🟠 Orange', '#FF7F00'], ['🟡 Yellow', '#FFFF00'],
                  ['🟢 Green', '#00FF00'], ['🔵 Blue', '#0000FF'], ['🟣 Indigo', '#4B0082'], ['💜 Violet', '#9400D3'],
                ]), 'COLOR');
              }
              this.setColour(330);
              this.setTooltip('Pick a color for drawing');
              this.setPreviousStatement(true);
              this.setNextStatement(true);
            }
          };
        }

        kidOnlyBlocks.filter(b => b.type !== 'set_color').forEach(block => {
          if (!Blockly.Blocks[block.type]) {
            Blockly.Blocks[block.type] = {
              init: function() {
                this.appendDummyInput().appendField(block.message0);
                this.setColour(block.colour);
                this.setTooltip(block.message0);
                this.setPreviousStatement(true);
                this.setNextStatement(true);
              }
            };
          }
        });

        if (blocklyRef.current.children.length > 0) blocklyRef.current.innerHTML = '';

        // Use standard Blockly flyout toolbox — exact same blocks as Google Blockly
        let toolbox: Record<string, unknown> = (challenge.toolbox_json && Object.keys(challenge.toolbox_json).length > 0)
          ? challenge.toolbox_json
          : { kind: 'flyoutToolbox', contents: [
              { kind: 'block', type: 'move_forward' },
              { kind: 'block', type: 'turn_right' },
              { kind: 'block', type: 'turn_left' },
              { kind: 'block', type: 'dance' },
            ]};

        // Detect categoryToolbox with 2+ categories — convert to flyoutToolbox with custom tabs
        const toolboxContentsRaw = toolbox as {kind?: string; contents?: {name?: string; colour?: string; contents?: unknown[]; custom?: string; kind?: string}[]};
        if (toolboxContentsRaw.kind === 'categoryToolbox' && toolboxContentsRaw.contents && toolboxContentsRaw.contents.length >= 2) {
          const cats = toolboxContentsRaw.contents
            .filter(c => c.kind === 'category')
            .map(c => ({
              name: c.name || 'Blocks',
              colour: c.colour || '#888',
              contents: (c.contents || []) as unknown[],
              custom: c.custom,
            }));
          setCategories(cats);
          setActiveCategory(0);
          // Initialize with first category's blocks as flyoutToolbox
          const firstContents = getCategoryContents(cats[0]);
          toolbox = { kind: 'flyoutToolbox', contents: firstContents };
        } else {
          setCategories([]);
        }

        const workspace = Blockly.inject(blocklyRef.current, {
          toolbox: toolbox as never,
          grid: { spacing: 20, length: 3, colour: '#fef3c7', snap: true },
          zoom: { controls: true, startScale: 0.75, maxScale: 2, minScale: 0.3, scaleSpeed: 1.1 },
          trashcan: true,
          sounds: true,
          renderer: 'zelos',
          move: { scrollbars: true, drag: true, wheel: true },
          theme: Blockly.Theme.defineTheme('kids_theme', {
            name: 'kids_theme',
            base: Blockly.Themes.Classic,
            blockStyles: {},
            categoryStyles: {},
            componentStyles: {
              workspaceBackgroundColour: '#FFF7ED',
              toolboxBackgroundColour: '#FFEDD5',
              flyoutBackgroundColour: '#FED7AA',
              flyoutOpacity: 1,
              scrollbarColour: '#F97316',
            },
            fontStyle: { family: 'Inter, sans-serif', weight: 'bold', size: 11 },
          }),
        });

        workspaceRef.current = workspace;

        // Enable workspace plugins (all cast to any for dynamic imports)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const P = plugins as any;
        if (ScrollOptions) { try { const p = new (ScrollOptions as any)(workspace); p.init(); } catch { /* */ } }
        if (P.ZoomToFitControl) { try { const p = new P.ZoomToFitControl(workspace); p.init(); } catch { /* */ } }
        if (P.WorkspaceSearch) { try { const p = new P.WorkspaceSearch(workspace); p.init(); } catch { /* */ } }
        if (P.CrossTabCopyPaste) { try { const p = new P.CrossTabCopyPaste(); p.init(); } catch { /* */ } }

        // Register CREATE_VARIABLE callback for variable categories
        workspace.registerButtonCallback('CREATE_VARIABLE', () => {
          Blockly.Variables.createVariableButtonHandler(workspace);
        });

        // Extract available blocks for mobile block buttons
        const toolboxContents = (toolbox as { contents?: { type?: string; kind?: string }[] }).contents || [];
        const blockList = toolboxContents
          .filter((item: { kind?: string }) => item.kind === 'block')
          .map((item: { type?: string }) => {
            const type = item.type || '';
            const kidBlock = kidOnlyBlocks.find(b => b.type === type);
            const label = kidBlock ? kidBlock.message0 : type.replace(/_/g, ' ');
            const colour = kidBlock ? String(kidBlock.colour) : '210';
            return { type, label, colour };
          });
        setAvailableBlocks(blockList);

        setBlocklyReady(true);
        console.log('✅ Blockly initialized');
      } catch (e) {
        console.error('❌ Blockly init failed:', e);
        setError('Failed to load code editor. Please refresh.');
      }
    };

    const timer = setTimeout(initBlockly, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [challenge, blocklyReady]);

  // Initialize PixiJS stage — only for non-console, non-web_preview types
  useEffect(() => {
    if (!challenge) return;
    const stageType = getStageType(challenge);
    if (stageType === 'console' || stageType === 'web_preview') return;
    if (!canvasRef.current) return;
    let cancelled = false;

    const initPixi = async () => {
      try {
        const PIXI = await import('pixi.js');
        if (cancelled || !canvasRef.current) return;

        const config = (challenge.stage_config || {}) as Record<string, unknown>;
        const spriteConfig = config.sprite as Record<string, unknown> | undefined;
        const goal = config.goal as Record<string, unknown> | undefined;
        const collectibles = config.collectibles as Record<string, unknown>[] | undefined;
        const obstacles = config.obstacles as Record<string, unknown>[] | undefined;

        let bgColor = 0xFFF7ED;
        if (stageType === 'drawing') bgColor = 0xFFFFFF;
        else if (stageType === 'platformer') bgColor = 0x87CEEB;
        else if (stageType === 'game') bgColor = 0x0a0a2a;
        else if (stageType === 'maze') bgColor = 0xF5DEB3;

        const app = new PIXI.Application();
        const dpr = window.devicePixelRatio || 1;
        await app.init({ canvas: canvasRef.current, width: STAGE_W, height: STAGE_H, backgroundColor: bgColor, antialias: true, resolution: dpr, autoDensity: true });
        pixiAppRef.current = app;

        // Helper: draw a 5-point star shape
        const drawStar = (g: InstanceType<typeof PIXI.Graphics>, cx: number, cy: number, outerR: number, innerR: number, color: number) => {
          const points: number[] = [];
          for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (Math.PI / 2) * -1 + (Math.PI / 5) * i;
            points.push(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
          }
          g.poly(points); g.fill(color);
        };

        // Helper: draw a diamond/gem shape
        const drawDiamond = (g: InstanceType<typeof PIXI.Graphics>, cx: number, cy: number, w: number, h: number, color: number, highlightColor: number) => {
          g.poly([cx, cy - h / 2, cx + w / 2, cy, cx, cy + h / 2, cx - w / 2, cy]); g.fill(color);
          g.poly([cx, cy - h / 2, cx + w / 2, cy, cx, cy - h * 0.1]); g.fill(highlightColor);
        };

        if (stageType === 'default') {
          // --- Soft gradient background ---
          const bg = new PIXI.Graphics();
          for (let y = 0; y < STAGE_H; y += 4) {
            const t = y / STAGE_H;
            const r = Math.round(255 + (245 - 255) * t);
            const gv = Math.round(251 + (230 - 251) * t);
            const b = Math.round(235 + (210 - 235) * t);
            bg.rect(0, y, STAGE_W, 4); bg.fill((r << 16) | (gv << 8) | b);
          }
          app.stage.addChild(bg);

          // --- Dotted grid lines with glow at intersections ---
          const grid = new PIXI.Graphics();
          for (let x = 0; x <= STAGE_W; x += GRID_SIZE) {
            for (let y = 0; y <= STAGE_H; y += 4) {
              if (y % 8 === 0) { grid.circle(x, y, 0.5); grid.fill({ color: 0xF97316, alpha: 0.2 }); }
            }
          }
          for (let y = 0; y <= STAGE_H; y += GRID_SIZE) {
            for (let x = 0; x <= STAGE_W; x += 4) {
              if (x % 8 === 0) { grid.circle(x, y, 0.5); grid.fill({ color: 0xF97316, alpha: 0.2 }); }
            }
          }
          // Glow at intersections
          for (let x = 0; x <= STAGE_W; x += GRID_SIZE) {
            for (let y = 0; y <= STAGE_H; y += GRID_SIZE) {
              grid.circle(x, y, 3); grid.fill({ color: 0xF97316, alpha: 0.08 });
              grid.circle(x, y, 1.5); grid.fill({ color: 0xF97316, alpha: 0.15 });
            }
          }
          app.stage.addChild(grid);

          // --- Obstacles: 3D brick blocks ---
          if (obstacles) obstacles.forEach(item => {
            const ox = (item.x as number) || 100, oy = (item.y as number) || 100;
            const brick = new PIXI.Graphics();
            // Shadow
            brick.roundRect(ox - 14, oy - 10, 28, 24, 3); brick.fill({ color: 0x000000, alpha: 0.15 });
            // Body
            brick.roundRect(ox - 16, oy - 12, 28, 24, 3); brick.fill(0x8B4513);
            // Highlight top
            brick.roundRect(ox - 16, oy - 12, 28, 8, 3); brick.fill({ color: 0xA0522D, alpha: 0.8 });
            // Brick lines
            brick.setStrokeStyle({ width: 1, color: 0x6B3410, alpha: 0.4 });
            brick.moveTo(ox - 16, oy - 4); brick.lineTo(ox + 12, oy - 4); brick.stroke();
            brick.moveTo(ox - 16, oy + 4); brick.lineTo(ox + 12, oy + 4); brick.stroke();
            brick.moveTo(ox - 2, oy - 12); brick.lineTo(ox - 2, oy - 4); brick.stroke();
            brick.moveTo(ox + 5, oy - 4); brick.lineTo(ox + 5, oy + 4); brick.stroke();
            brick.moveTo(ox - 8, oy + 4); brick.lineTo(ox - 8, oy + 12); brick.stroke();
            app.stage.addChild(brick);
          });

          // --- Collectibles: geometric diamond gems ---
          if (collectibles) collectibles.forEach(item => {
            const cx = (item.x as number) || 100, cy = (item.y as number) || 100;
            const gem = new PIXI.Graphics();
            drawDiamond(gem, cx, cy, 20, 26, 0x60A5FA, 0x93C5FD);
            // Sparkle
            gem.circle(cx - 4, cy - 6, 1.5); gem.fill({ color: 0xFFFFFF, alpha: 0.8 });
            app.stage.addChild(gem);
          });

          // --- Goal: pulsing golden star ---
          if (goal) {
            const gx = (goal.x as number) || 350, gy = (goal.y as number) || 200;
            const goalContainer = new PIXI.Container();
            goalContainer.position.set(gx, gy);
            // Glow
            const glow = new PIXI.Graphics();
            glow.circle(0, 0, 18); glow.fill({ color: 0xFBBF24, alpha: 0.15 });
            goalContainer.addChild(glow);
            // Star
            const star = new PIXI.Graphics();
            drawStar(star, 0, 0, 14, 6, 0xFBBF24);
            // Highlight
            drawStar(star, -1, -1, 8, 3, 0xFDE68A);
            goalContainer.addChild(star);
            app.stage.addChild(goalContainer);
            // Pulsing animation
            let pulse = 0;
            app.ticker.add(() => {
              pulse += 0.05;
              goalContainer.scale.set(1 + Math.sin(pulse) * 0.08);
              glow.alpha = 0.12 + Math.sin(pulse) * 0.06;
            });
          }

          // --- Robot character drawn with Graphics ---
          const startX = spriteConfig ? (spriteConfig.x as number) || 60 : 60;
          const startY = spriteConfig ? (spriteConfig.y as number) || 60 : 60;
          const robotContainer = new PIXI.Container();
          robotContainer.position.set(startX, startY);
          const rg = new PIXI.Graphics();
          // Wheels
          rg.circle(-8, 14, 4); rg.fill(0x4B5563);
          rg.circle(8, 14, 4); rg.fill(0x4B5563);
          // Body (rounded rect)
          rg.roundRect(-12, -6, 24, 20, 4); rg.fill(0xF97316);
          // Body highlight
          rg.roundRect(-10, -4, 20, 6, 2); rg.fill({ color: 0xFB923C, alpha: 0.6 });
          // Head
          rg.circle(0, -12, 9); rg.fill(0xF97316);
          // Head highlight
          rg.circle(-2, -14, 4); rg.fill({ color: 0xFDBA74, alpha: 0.4 });
          // Eyes (LED cyan)
          rg.circle(-4, -13, 2.5); rg.fill(0x06B6D4);
          rg.circle(4, -13, 2.5); rg.fill(0x06B6D4);
          // Eye glow
          rg.circle(-4, -13, 1); rg.fill({ color: 0xFFFFFF, alpha: 0.7 });
          rg.circle(4, -13, 1); rg.fill({ color: 0xFFFFFF, alpha: 0.7 });
          // Antenna
          rg.setStrokeStyle({ width: 2, color: 0x9CA3AF });
          rg.moveTo(0, -21); rg.lineTo(0, -26); rg.stroke();
          rg.circle(0, -27, 2); rg.fill(0xEF4444);
          robotContainer.addChild(rg);
          app.stage.addChild(robotContainer);
          robotSpriteRef.current = robotContainer;
          robotStateRef.current = { x: startX, y: startY, direction: 0 };

        } else if (stageType === 'drawing') {
          // --- Paper texture: grid of tiny dots ---
          const paper = new PIXI.Graphics();
          for (let x = 10; x < STAGE_W; x += 10) {
            for (let y = 10; y < STAGE_H; y += 10) {
              paper.circle(x, y, 0.4); paper.fill({ color: 0xD1D5DB, alpha: 0.3 });
            }
          }
          app.stage.addChild(paper);

          // --- Color palette in corner ---
          const palette = new PIXI.Graphics();
          const colors = [0xEF4444, 0xF97316, 0xFBBF24, 0x22C55E, 0x3B82F6, 0x8B5CF6, 0x000000];
          colors.forEach((c, i) => {
            palette.circle(15 + i * 14, STAGE_H - 15, 5); palette.fill(c);
            palette.circle(15 + i * 14, STAGE_H - 15, 5); palette.setStrokeStyle({ width: 1, color: 0xE5E7EB }); palette.stroke();
          });
          app.stage.addChild(palette);

          // --- Pen cursor: colored circle with ring ---
          const penContainer = new PIXI.Container();
          penContainer.position.set(STAGE_W / 2, STAGE_H / 2);
          const penG = new PIXI.Graphics();
          // Outer ring
          penG.circle(0, 0, 8); penG.setStrokeStyle({ width: 2, color: 0xF97316, alpha: 0.5 }); penG.stroke();
          // Inner dot
          penG.circle(0, 0, 4); penG.fill(0xF97316);
          // Highlight
          penG.circle(-1, -1, 1.5); penG.fill({ color: 0xFFFFFF, alpha: 0.5 });
          penContainer.addChild(penG);
          app.stage.addChild(penContainer);
          robotSpriteRef.current = penContainer;
          robotStateRef.current = { x: STAGE_W / 2, y: STAGE_H / 2, direction: 0 };

        } else if (stageType === 'platformer') {
          // --- Sky gradient background ---
          const sky = new PIXI.Graphics();
          for (let y = 0; y < STAGE_H; y += 2) {
            const t = y / STAGE_H;
            const r = Math.round(135 + (240 - 135) * t);
            const gv = Math.round(206 + (248 - 206) * t);
            const b = Math.round(235 + (255 - 235) * t);
            sky.rect(0, y, STAGE_W, 2); sky.fill((r << 16) | (gv << 8) | b);
          }
          app.stage.addChild(sky);

          // --- Clouds ---
          const drawCloud = (cx: number, cy: number, scale: number) => {
            const cloud = new PIXI.Graphics();
            cloud.circle(0, 0, 16 * scale); cloud.fill({ color: 0xFFFFFF, alpha: 0.8 });
            cloud.circle(-14 * scale, 4 * scale, 12 * scale); cloud.fill({ color: 0xFFFFFF, alpha: 0.8 });
            cloud.circle(14 * scale, 4 * scale, 12 * scale); cloud.fill({ color: 0xFFFFFF, alpha: 0.8 });
            cloud.circle(8 * scale, -4 * scale, 10 * scale); cloud.fill({ color: 0xFFFFFF, alpha: 0.7 });
            cloud.position.set(cx, cy);
            return cloud;
          };
          const cloud1 = drawCloud(80, 40, 1); app.stage.addChild(cloud1);
          const cloud2 = drawCloud(280, 55, 0.7); app.stage.addChild(cloud2);
          const cloud3 = drawCloud(360, 25, 0.5); app.stage.addChild(cloud3);
          // Floating animation
          let cloudT = 0;
          app.ticker.add(() => {
            cloudT += 0.01;
            cloud1.x = 80 + Math.sin(cloudT) * 8;
            cloud2.x = 280 + Math.sin(cloudT * 0.8 + 1) * 6;
            cloud3.x = 360 + Math.sin(cloudT * 1.2 + 2) * 5;
          });

          // --- Ground: grass-topped brown platform ---
          const ground = new PIXI.Graphics();
          ground.rect(0, STAGE_H - 26, STAGE_W, 26); ground.fill(0x8B5E3C);
          ground.rect(0, STAGE_H - 30, STAGE_W, 6); ground.fill(0x4ADE80);
          ground.rect(0, STAGE_H - 30, STAGE_W, 2); ground.fill({ color: 0x22C55E, alpha: 0.6 });
          app.stage.addChild(ground);

          // --- Floating platforms with grass ---
          const drawPlatform = (px: number, py: number, pw: number) => {
            const plat = new PIXI.Graphics();
            // Shadow
            plat.roundRect(px + 2, py + 3, pw, 12, 4); plat.fill({ color: 0x000000, alpha: 0.1 });
            // Body
            plat.roundRect(px, py, pw, 12, 4); plat.fill(0x8B5E3C);
            // Grass top
            plat.roundRect(px, py - 2, pw, 5, 2); plat.fill(0x4ADE80);
            return plat;
          };
          app.stage.addChild(drawPlatform(80, 200, 100));
          app.stage.addChild(drawPlatform(240, 150, 100));
          app.stage.addChild(drawPlatform(140, 100, 80));

          // --- Collectible coins ---
          if (collectibles) collectibles.forEach(item => {
            const cx = (item.x as number) || 130, cy = (item.y as number) || 180;
            const coin = new PIXI.Graphics();
            coin.circle(cx, cy, 9); coin.fill(0xFBBF24);
            coin.circle(cx, cy, 7); coin.setStrokeStyle({ width: 1, color: 0xF59E0B }); coin.stroke();
            // Shine
            coin.circle(cx - 2, cy - 2, 2); coin.fill({ color: 0xFEF3C7, alpha: 0.7 });
            app.stage.addChild(coin);
          });

          // --- Frog character ---
          const startX = spriteConfig ? (spriteConfig.x as number) || 60 : 60;
          const startY = spriteConfig ? (spriteConfig.y as number) || (STAGE_H - 50) : STAGE_H - 50;
          const frogContainer = new PIXI.Container();
          frogContainer.position.set(startX, startY);
          const fg = new PIXI.Graphics();
          // Body
          fg.circle(0, 2, 12); fg.fill(0x4ADE80);
          // Belly
          fg.ellipse(0, 5, 7, 6); fg.fill({ color: 0xBBF7D0, alpha: 0.7 });
          // Eyes (big white with black pupils)
          fg.circle(-6, -8, 6); fg.fill(0xFFFFFF);
          fg.circle(6, -8, 6); fg.fill(0xFFFFFF);
          fg.circle(-5, -8, 3); fg.fill(0x1F2937);
          fg.circle(7, -8, 3); fg.fill(0x1F2937);
          // Eye shine
          fg.circle(-6, -10, 1.5); fg.fill({ color: 0xFFFFFF, alpha: 0.8 });
          fg.circle(6, -10, 1.5); fg.fill({ color: 0xFFFFFF, alpha: 0.8 });
          // Smile
          fg.setStrokeStyle({ width: 1.5, color: 0x166534 });
          fg.arc(0, -2, 5, 0.2, Math.PI - 0.2); fg.stroke();
          frogContainer.addChild(fg);
          app.stage.addChild(frogContainer);
          robotSpriteRef.current = frogContainer;
          robotStateRef.current = { x: startX, y: startY, direction: 0 };

        } else if (stageType === 'game') {
          // --- Deep space gradient background ---
          const spaceBg = new PIXI.Graphics();
          for (let y = 0; y < STAGE_H; y += 2) {
            const t = y / STAGE_H;
            const r = Math.round(10 + (20 - 10) * t);
            const gv = Math.round(10 + (5 - 10) * t);
            const b = Math.round(42 + (60 - 42) * t);
            spaceBg.rect(0, y, STAGE_W, 2); spaceBg.fill((r << 16) | (gv << 8) | b);
          }
          app.stage.addChild(spaceBg);

          // --- Nebula: semi-transparent colored clouds ---
          const nebula = new PIXI.Graphics();
          nebula.circle(100, 80, 50); nebula.fill({ color: 0x7C3AED, alpha: 0.04 });
          nebula.circle(120, 90, 35); nebula.fill({ color: 0x6366F1, alpha: 0.05 });
          nebula.circle(300, 200, 60); nebula.fill({ color: 0x3B82F6, alpha: 0.03 });
          nebula.circle(320, 180, 40); nebula.fill({ color: 0x8B5CF6, alpha: 0.04 });
          app.stage.addChild(nebula);

          // --- Twinkling stars ---
          const starDots: InstanceType<typeof PIXI.Graphics>[] = [];
          for (let i = 0; i < 60; i++) {
            const dot = new PIXI.Graphics();
            const sz = Math.random() * 1.8 + 0.3;
            dot.circle(0, 0, sz); dot.fill(0xFFFFFF);
            dot.position.set(Math.random() * STAGE_W, Math.random() * STAGE_H);
            dot.alpha = Math.random() * 0.6 + 0.2;
            app.stage.addChild(dot);
            starDots.push(dot);
          }
          // Twinkle animation
          app.ticker.add(() => {
            starDots.forEach((d, i) => {
              d.alpha = 0.3 + Math.sin(Date.now() * 0.002 + i * 0.7) * 0.3;
            });
          });

          // --- Falling items as shapes ---
          const fallingItems = config.fallingItems as Record<string, unknown>[] | undefined;
          if (fallingItems) {
            fallingItems.slice(0, 3).forEach((_, i) => {
              const fi = new PIXI.Graphics();
              const fx = 80 + i * 120, fy = 40 + i * 30;
              // Asteroid-like shape
              fi.circle(fx, fy, 8); fi.fill(0x9CA3AF);
              fi.circle(fx - 3, fy - 2, 2); fi.fill({ color: 0x6B7280, alpha: 0.6 });
              fi.circle(fx + 2, fy + 3, 1.5); fi.fill({ color: 0x6B7280, alpha: 0.5 });
              // Trail
              fi.setStrokeStyle({ width: 1, color: 0x9CA3AF, alpha: 0.2 });
              fi.moveTo(fx + 8, fy); fi.lineTo(fx + 20, fy - 4); fi.stroke();
              fi.alpha = 0.7;
              app.stage.addChild(fi);
            });
          }

          // --- Spaceship drawn with Graphics ---
          const startX = spriteConfig ? (spriteConfig.x as number) || STAGE_W / 2 : STAGE_W / 2;
          const startY = spriteConfig ? (spriteConfig.y as number) || STAGE_H - 40 : STAGE_H - 40;
          const shipContainer = new PIXI.Container();
          shipContainer.position.set(startX, startY);
          const sg = new PIXI.Graphics();
          // Exhaust flame
          sg.poly([- 5, 12, 0, 22, 5, 12]); sg.fill({ color: 0xEF4444, alpha: 0.7 });
          sg.poly([-3, 12, 0, 18, 3, 12]); sg.fill({ color: 0xFBBF24, alpha: 0.8 });
          // Body (triangle)
          sg.poly([0, -16, -12, 12, 12, 12]); sg.fill(0xD1D5DB);
          // Body highlight
          sg.poly([0, -16, -6, 6, 6, 6]); sg.fill({ color: 0xE5E7EB, alpha: 0.5 });
          // Wings
          sg.poly([-12, 12, -18, 10, -10, 4]); sg.fill(0xF97316);
          sg.poly([12, 12, 18, 10, 10, 4]); sg.fill(0xF97316);
          // Cockpit window
          sg.circle(0, 0, 4); sg.fill(0x06B6D4);
          sg.circle(-1, -1, 1.5); sg.fill({ color: 0xFFFFFF, alpha: 0.4 });
          shipContainer.addChild(sg);
          app.stage.addChild(shipContainer);
          // Flame flicker
          let flameT = 0;
          app.ticker.add(() => {
            flameT += 0.1;
            sg.alpha = 0.92 + Math.sin(flameT * 3) * 0.08;
          });
          robotSpriteRef.current = shipContainer;
          robotStateRef.current = { x: startX, y: startY, direction: 0 };

        } else if (stageType === 'maze') {
          // --- Stone/tile floor ---
          const floor = new PIXI.Graphics();
          for (let tx = 0; tx < STAGE_W / GRID_SIZE; tx++) {
            for (let ty = 0; ty < STAGE_H / GRID_SIZE; ty++) {
              const color = (tx + ty) % 2 === 0 ? 0xE8D5B7 : 0xDBC8A9;
              floor.rect(tx * GRID_SIZE, ty * GRID_SIZE, GRID_SIZE, GRID_SIZE); floor.fill(color);
            }
          }
          app.stage.addChild(floor);

          // --- 3D stone walls ---
          const walls = config.walls as { x1: number; y1: number; x2: number; y2: number }[] | undefined;
          const drawWall = (x1: number, y1: number, x2: number, y2: number) => {
            const w = new PIXI.Graphics();
            const isVert = Math.abs(x2 - x1) < Math.abs(y2 - y1);
            const thickness = 6;
            if (isVert) {
              // Shadow
              w.rect(x1 + 1, y1 + 1, thickness, y2 - y1); w.fill({ color: 0x000000, alpha: 0.15 });
              // Wall body
              w.rect(x1 - thickness / 2, y1, thickness, y2 - y1); w.fill(0x8B7355);
              // Highlight
              w.rect(x1 - thickness / 2, y1, 2, y2 - y1); w.fill({ color: 0xBBA882, alpha: 0.6 });
            } else {
              w.rect(x1 + 1, y1 + 1, x2 - x1, thickness); w.fill({ color: 0x000000, alpha: 0.15 });
              w.rect(x1, y1 - thickness / 2, x2 - x1, thickness); w.fill(0x8B7355);
              w.rect(x1, y1 - thickness / 2, x2 - x1, 2); w.fill({ color: 0xBBA882, alpha: 0.6 });
            }
            return w;
          };

          if (walls) {
            walls.forEach(wl => app.stage.addChild(drawWall(wl.x1, wl.y1, wl.x2, wl.y2)));
          } else {
            app.stage.addChild(drawWall(80, 0, 80, 200));
            app.stage.addChild(drawWall(160, 100, 160, 300));
            app.stage.addChild(drawWall(240, 0, 240, 200));
            app.stage.addChild(drawWall(320, 100, 320, 300));
          }

          // --- Cheese goal ---
          const gx = goal ? (goal.x as number) || 360 : 360;
          const gy = goal ? (goal.y as number) || 260 : 260;
          const cheese = new PIXI.Graphics();
          // Wedge shape
          cheese.poly([gx - 10, gy + 8, gx + 10, gy + 8, gx + 6, gy - 8, gx - 2, gy - 8]); cheese.fill(0xFBBF24);
          // Holes
          cheese.circle(gx - 2, gy + 2, 2.5); cheese.fill(0xF59E0B);
          cheese.circle(gx + 4, gy - 2, 1.8); cheese.fill(0xF59E0B);
          cheese.circle(gx + 1, gy + 6, 1.5); cheese.fill(0xF59E0B);
          // Highlight
          cheese.poly([gx - 2, gy - 8, gx + 6, gy - 8, gx + 3, gy - 3, gx - 1, gy - 3]); cheese.fill({ color: 0xFDE68A, alpha: 0.5 });
          app.stage.addChild(cheese);

          // --- Mouse character ---
          const startX = spriteConfig ? (spriteConfig.x as number) || 30 : 30;
          const startY = spriteConfig ? (spriteConfig.y as number) || 30 : 30;
          const mouseContainer = new PIXI.Container();
          mouseContainer.position.set(startX, startY);
          const mg = new PIXI.Graphics();
          // Tail
          mg.setStrokeStyle({ width: 1.5, color: 0xF9A8D4 });
          mg.moveTo(10, 4); mg.quadraticCurveTo(18, 8, 16, -2); mg.stroke();
          // Body
          mg.circle(0, 2, 11); mg.fill(0x9CA3AF);
          // Belly
          mg.ellipse(0, 5, 6, 5); mg.fill({ color: 0xF3F4F6, alpha: 0.7 });
          // Ears (pink)
          mg.circle(-8, -8, 6); mg.fill(0xF9A8D4);
          mg.circle(8, -8, 6); mg.fill(0xF9A8D4);
          // Inner ears
          mg.circle(-8, -8, 3.5); mg.fill(0xFBCFE8);
          mg.circle(8, -8, 3.5); mg.fill(0xFBCFE8);
          // Eyes
          mg.circle(-4, -2, 2.5); mg.fill(0x1F2937);
          mg.circle(4, -2, 2.5); mg.fill(0x1F2937);
          mg.circle(-4.5, -3, 1); mg.fill({ color: 0xFFFFFF, alpha: 0.7 });
          mg.circle(3.5, -3, 1); mg.fill({ color: 0xFFFFFF, alpha: 0.7 });
          // Nose
          mg.circle(0, 1, 1.5); mg.fill(0xFB7185);
          // Whiskers
          mg.setStrokeStyle({ width: 0.5, color: 0x6B7280, alpha: 0.5 });
          mg.moveTo(-12, 0); mg.lineTo(-5, 1); mg.stroke();
          mg.moveTo(-11, 3); mg.lineTo(-5, 2); mg.stroke();
          mg.moveTo(12, 0); mg.lineTo(5, 1); mg.stroke();
          mg.moveTo(11, 3); mg.lineTo(5, 2); mg.stroke();
          mouseContainer.addChild(mg);
          app.stage.addChild(mouseContainer);
          robotSpriteRef.current = mouseContainer;
          robotStateRef.current = { x: startX, y: startY, direction: 0 };
        }

        console.log('✅ PixiJS stage initialized (' + stageType + ')');
      } catch (e) {
        console.error('❌ PixiJS init failed:', e);
      }
    };

    const timer = setTimeout(initPixi, 500);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [challenge]);

  // Get resolved contents for a category (handles custom categories like VARIABLE, PROCEDURE)
  const getCategoryContents = (cat: {contents: unknown[]; custom?: string}): unknown[] => {
    if (cat.custom === 'VARIABLE') {
      return [
        {kind: 'button', text: 'Create Variable', callbackKey: 'CREATE_VARIABLE'},
        {kind: 'block', type: 'variables_set'},
        {kind: 'block', type: 'variables_get'},
      ];
    } else if (cat.custom === 'PROCEDURE') {
      return [
        {kind: 'block', type: 'procedures_defnoreturn'},
        {kind: 'block', type: 'procedures_defreturn'},
        {kind: 'block', type: 'procedures_callnoreturn'},
        {kind: 'block', type: 'procedures_callreturn'},
      ];
    }
    return cat.contents || [];
  };

  // Switch active category tab — updates Blockly flyout
  const switchCategory = (index: number) => {
    setActiveCategory(index);
    const workspace = workspaceRef.current;
    if (!workspace || !categories[index]) return;
    const contents = getCategoryContents(categories[index]);
    workspace.updateToolbox({
      kind: 'flyoutToolbox',
      contents: contents,
    });

    // Update available blocks for mobile
    const blockList = (contents as {kind?: string; type?: string}[])
      .filter(item => item.kind === 'block')
      .map(item => {
        const type = item.type || '';
        const label = type.replace(/_/g, ' ');
        return { type, label, colour: categories[index].colour || '210' };
      });
    setAvailableBlocks(blockList);
  };

  // Add a block to workspace when user clicks a block button
  const addBlock = (blockType: string) => {
    const workspace = workspaceRef.current;
    const Blockly = blocklyModuleRef.current;
    if (!workspace || !Blockly) return;

    const block = workspace.newBlock(blockType);
    block.initSvg();
    block.render();

    // Connect to the last block's chain
    const topBlocks = workspace.getTopBlocks(true);
    if (topBlocks.length > 1) {
      const lastBlock = topBlocks[topBlocks.length - 2];
      let current = lastBlock;
      while (current.getNextBlock()) current = current.getNextBlock();
      if (current.nextConnection && block.previousConnection) {
        current.nextConnection.connect(block.previousConnection);
      }
    }
    workspace.centerOnBlock(block.id);
    setShowMobileBlocks(false);
  };

  interface BlockNode {
    type: string;
    fields: Record<string, string | number>;
    children: BlockNode[]; // inner blocks (e.g. DO body of repeat)
  }

  const getBlockTree = (): BlockNode[] => {
    const workspace = workspaceRef.current;
    if (!workspace) return [];
    const nodes: BlockNode[] = [];
    const topBlocks = workspace.getTopBlocks(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parseBlock = (block: any): BlockNode | null => {
      if (!block) return null;
      const fields: Record<string, string | number> = {};

      // Read field values from all inputs
      try {
        const inputs = block.inputList || [];
        inputs.forEach((input: { fieldRow?: { name_?: string; getValue?: () => unknown }[] }) => {
          (input.fieldRow || []).forEach((field: { name_?: string; getValue?: () => unknown }) => {
            if (field.name_ && field.getValue) {
              const val = field.getValue();
              if (val !== undefined && val !== null) fields[field.name_] = val as string | number;
            }
          });
        });
      } catch { /* ignore */ }

      // Read connected value blocks using Blockly's getInputTargetBlock API
      try {
        const valueInputNames = ['TEXT', 'TIMES', 'NUM', 'VALUE', 'MESSAGE', 'A', 'B', 'LIST', 'FROM', 'TO', 'BY', 'VAR'];
        for (const inputName of valueInputNames) {
          try {
            const target = block.getInputTargetBlock?.(inputName);
            if (target) {
              if (target.type === 'math_number') {
                fields[inputName] = Number(target.getFieldValue('NUM')) || 0;
              } else if (target.type === 'text') {
                fields[inputName] = target.getFieldValue('TEXT') ?? '';
              } else if (target.type === 'text_join') {
                fields[inputName] = '[joined text]';
              } else if (target.type === 'variables_get') {
                fields[inputName] = `{${target.getFieldValue('VAR') || 'var'}}`;
              } else if (target.type === 'math_arithmetic') {
                fields[inputName] = '[math]';
              }
            }
          } catch { /* input doesn't exist on this block */ }
        }
      } catch { /* ignore */ }

      const node: BlockNode = { type: block.type, fields, children: [] };

      // Get inner statement blocks (e.g. DO body of repeat)
      try {
        const doBlock = block.getInputTargetBlock?.('DO');
        if (doBlock) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let inner: any = doBlock;
          while (inner) {
            const child = parseBlock(inner);
            if (child) node.children.push(child);
            inner = inner.getNextBlock?.();
          }
        }
      } catch { /* ignore */ }

      return node;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    topBlocks.forEach((block: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = block;
      while (current) {
        const node = parseBlock(current);
        if (node) nodes.push(node);
        current = current.getNextBlock?.();
      }
    });

    return nodes;
  };

  const flattenBlockTreeToNodes = (nodes: BlockNode[]): BlockNode[] => {
    const sequence: BlockNode[] = [];
    for (const node of nodes) {
      if (node.type === 'controls_repeat_ext' || node.type === 'controls_repeat') {
        const times = (node.fields.TIMES as number) || (node.fields.NUM as number) || 3;
        const innerActions = flattenBlockTreeToNodes(node.children);
        for (let r = 0; r < times; r++) sequence.push(...innerActions);
      } else if (node.type === 'math_number' || node.type === 'text') {
        // Skip value blocks — they're read via fields
      } else {
        sequence.push(node);
      }
    }
    return sequence;
  };

  const getBlockSequence = (): string[] => {
    const tree = getBlockTree();
    return flattenBlockTreeToNodes(tree).map(n => n.type);
  };

  const getExecutionSequence = (): BlockNode[] => {
    const tree = getBlockTree();
    return flattenBlockTreeToNodes(tree);
  };

  const getBlockCount = (): number => {
    const tree = getBlockTree();
    let count = 0;
    const countNodes = (nodes: BlockNode[]) => {
      for (const n of nodes) {
        count++;
        countNodes(n.children);
      }
    };
    countNodes(tree);
    return count;
  };

  const animateStepNode = (node: BlockNode): Promise<string> => {
    const action = node.type;
    console.log('🔧 animateStepNode:', action, 'fields:', JSON.stringify(node.fields));
    return new Promise(resolve => {
      const robot = robotSpriteRef.current;
      const state = robotStateRef.current;
      const stageType = challenge ? getStageType(challenge) : 'default';

      // Console type: output text only
      if (stageType === 'console') {
        const pushTerminal = (line: string) => { terminalLinesRef.current.push(line); setTerminalLines(prev => [...prev, line]); };
        // Handle print blocks (Blockly built-in text_print or custom print_text)
        if (action === 'text_print' || action === 'print_text') {
          const text = (node.fields.TEXT as string) || (node.fields.MESSAGE as string) || 'Hello, World!';
          pushTerminal(`>>> ${text}`);
          resolve(`📝 Printed: "${text}"`);
          return;
        }
        if (action === 'ask_input') { pushTerminal('>>> Enter your name: _'); resolve('❓ Waiting for input...'); return; }
        if (action === 'set_variable' || action === 'variables_set') {
          const varName = (node.fields.VAR as string) || 'name';
          const varVal = (node.fields.VALUE as string) || '"Coder"';
          pushTerminal(`>>> ${varName} = ${varVal}`);
          resolve(`📦 Variable ${varName} set!`);
          return;
        }
        if (action === 'if_else' || action === 'controls_if') { pushTerminal('>>> Checking condition...'); resolve('🔀 Checking condition...'); return; }
        if (action === 'text_join') { pushTerminal('>>> Joining text...'); resolve('🔗 Text joined!'); return; }
        // Default console handler
        pushTerminal(`>>> ${action}`);
        resolve(`⚙️ Executed: ${action}`);
        return;
      }

      // Web preview type
      if (stageType === 'web_preview') {
        switch (action) {
          case 'html_heading': { setWebPreviewHtml(prev => [...prev, '<h2>My Page</h2>']); resolve('📝 Heading added!'); return; }
          case 'html_paragraph': { setWebPreviewHtml(prev => [...prev, '<p>Hello! Welcome to my page.</p>']); resolve('📄 Paragraph added!'); return; }
          case 'html_image': { setWebPreviewHtml(prev => [...prev, '<div>🖼️ [Image placeholder]</div>']); resolve('🖼️ Image added!'); return; }
          case 'html_list': { setWebPreviewHtml(prev => [...prev, '<ul><li>Item 1</li><li>Item 2</li></ul>']); resolve('📋 List added!'); return; }
          default: { resolve(`⚙️ Executed: ${action}`); return; }
        }
      }

      // Drawing type: draw on pixi canvas
      if (stageType === 'drawing' && pixiAppRef.current) {
        const drawGraphics = async () => {
          const PIXI = await import('pixi.js');
          const gfx = new PIXI.Graphics();
          const cx = state.x, cy = state.y;
          if (action === 'set_color') {
            const hexStr = (node.fields.COLOR as string) || '#FF0000';
            drawColorRef.current = parseInt(hexStr.replace('#', ''), 16);
            resolve(`🎨 Color set to ${hexStr}!`);
          } else if (action === 'draw_arc') {
            const color = drawColorRef.current;
            gfx.setStrokeStyle({ width: 3, color });
            gfx.arc(cx, cy, 30 + Math.random() * 20, 0, Math.PI * (0.5 + Math.random()));
            gfx.stroke();
            pixiAppRef.current.stage.addChild(gfx);
            resolve('⭕ Arc drawn!');
          } else if (action === 'draw_line') {
            const color = drawColorRef.current;
            gfx.setStrokeStyle({ width: 2, color });
            const dx = (Math.random() - 0.5) * 80;
            const dy = (Math.random() - 0.5) * 80;
            gfx.moveTo(cx, cy); gfx.lineTo(cx + dx, cy + dy);
            gfx.stroke();
            state.x = Math.max(20, Math.min(STAGE_W - 20, cx + dx));
            state.y = Math.max(20, Math.min(STAGE_H - 20, cy + dy));
            if (robot) robot.position.set(state.x, state.y);
            pixiAppRef.current.stage.addChild(gfx);
            resolve('📏 Line drawn!');
          } else {
            resolve(`⚙️ Executed: ${action}`);
          }
        };
        drawGraphics();
        return;
      }

      if (!robot) {
        // Fallback for text-only actions
        switch (action) {
          case 'print_text': resolve('📝 Text printed!'); break;
          case 'ask_input': resolve('❓ Waiting for input...'); break;
          case 'set_variable': resolve('📦 Variable set!'); break;
          case 'if_else': resolve('🔀 Checking condition...'); break;
          default: resolve(`⚙️ Executed: ${action}`); break;
        }
        return;
      }

      const stepSize = GRID_SIZE;

      switch (action) {
        case 'move_forward': {
          const dx = Math.round(Math.cos(state.direction * Math.PI / 180)) * stepSize;
          const dy = Math.round(Math.sin(state.direction * Math.PI / 180)) * stepSize;
          const newX = Math.max(20, Math.min(STAGE_W - 20, state.x + dx));
          const newY = Math.max(20, Math.min(STAGE_H - 20, state.y + dy));
          const sX = state.x, sY = state.y;
          const dur = 400; const st = Date.now();
          const anim = () => { const p = Math.min((Date.now()-st)/dur,1); const e = 1-Math.pow(1-p,3); robot.position.set(sX+(newX-sX)*e, sY+(newY-sY)*e); if(p<1) requestAnimationFrame(anim); else { state.x=newX; state.y=newY; resolve('🤖 Moved forward!'); }};
          requestAnimationFrame(anim); break;
        }
        case 'turn_right': {
          state.direction = (state.direction + 90) % 360;
          const tR = state.direction * Math.PI / 180; const sR = robot.rotation;
          const dur = 300; const st = Date.now();
          const anim = () => { const p = Math.min((Date.now()-st)/dur,1); robot.rotation = sR+(tR-sR)*p; if(p<1) requestAnimationFrame(anim); else resolve('🔄 Turned right!'); };
          requestAnimationFrame(anim); break;
        }
        case 'turn_left': {
          state.direction = (state.direction - 90 + 360) % 360;
          const tR = state.direction * Math.PI / 180; const sR = robot.rotation;
          const dur = 300; const st = Date.now();
          const anim = () => { const p = Math.min((Date.now()-st)/dur,1); robot.rotation = sR+(tR-sR)*p; if(p<1) requestAnimationFrame(anim); else resolve('↩️ Turned left!'); };
          requestAnimationFrame(anim); break;
        }
        case 'dance': {
          const origY = robot.position.y; const dur = 600; const st = Date.now();
          const anim = () => { const p = (Date.now()-st)/dur; if(p<1) { robot.position.y = origY - Math.sin(p*Math.PI*3)*20; robot.rotation = Math.sin(p*Math.PI*4)*0.3; requestAnimationFrame(anim); } else { robot.position.y = origY; robot.rotation = state.direction*Math.PI/180; resolve('💃 Danced!'); }};
          requestAnimationFrame(anim); break;
        }
        case 'say_hello': case 'jump': {
          const origY = robot.position.y; const dur = 500; const st = Date.now();
          const anim = () => { const p = (Date.now()-st)/dur; if(p<1) { robot.position.y = origY - Math.sin(p*Math.PI)*40; requestAnimationFrame(anim); } else { robot.position.y = origY; resolve(action==='say_hello'?'👋 Waved hello!':'⬆️ Jumped!'); }};
          requestAnimationFrame(anim); break;
        }
        case 'collect': {
          const os = robot.scale.x; const dur = 400; const st = Date.now();
          const anim = () => { const p = (Date.now()-st)/dur; if(p<1) { const s = os+Math.sin(p*Math.PI)*0.3; robot.scale.set(s,s); requestAnimationFrame(anim); } else { robot.scale.set(os,os); resolve('🎒 Collected item!'); }};
          requestAnimationFrame(anim); break;
        }
        case 'move_left': { const nX=Math.max(20,state.x-stepSize); const sX=state.x; const d=400;const s=Date.now(); const a=()=>{const p=Math.min((Date.now()-s)/d,1);robot.position.x=sX+(nX-sX)*(1-Math.pow(1-p,3));if(p<1)requestAnimationFrame(a);else{state.x=nX;resolve('⬅️ Moved left!');}}; requestAnimationFrame(a); break; }
        case 'move_right': { const nX=Math.min(STAGE_W-20,state.x+stepSize); const sX=state.x; const d=400;const s=Date.now(); const a=()=>{const p=Math.min((Date.now()-s)/d,1);robot.position.x=sX+(nX-sX)*(1-Math.pow(1-p,3));if(p<1)requestAnimationFrame(a);else{state.x=nX;resolve('➡️ Moved right!');}}; requestAnimationFrame(a); break; }
        case 'move_up': { const nY=Math.max(20,state.y-stepSize); const sY=state.y; const d=400;const s=Date.now(); const a=()=>{const p=Math.min((Date.now()-s)/d,1);robot.position.y=sY+(nY-sY)*(1-Math.pow(1-p,3));if(p<1)requestAnimationFrame(a);else{state.y=nY;resolve('⬆️ Moved up!');}}; requestAnimationFrame(a); break; }
        case 'move_down': { const nY=Math.min(STAGE_H-20,state.y+stepSize); const sY=state.y; const d=400;const s=Date.now(); const a=()=>{const p=Math.min((Date.now()-s)/d,1);robot.position.y=sY+(nY-sY)*(1-Math.pow(1-p,3));if(p<1)requestAnimationFrame(a);else{state.y=nY;resolve('⬇️ Moved down!');}}; requestAnimationFrame(a); break; }
        case 'when_space_pressed': resolve('⌨️ Listening for Space bar...'); break;
        case 'when_arrow_left': resolve('⬅️ Listening for Left Arrow...'); break;
        case 'when_arrow_right': resolve('➡️ Listening for Right Arrow...'); break;
        case 'when_start': resolve('🟢 Program started!'); break;
        case 'create_star': resolve('⭐ Star created!'); break;
        case 'create_asteroid': resolve('☄️ Asteroid created!'); break;
        case 'if_touching': resolve('🤝 Checking collision...'); break;
        case 'add_score': resolve('🏆 Score +1!'); break;
        case 'game_over': resolve('💥 Game Over!'); break;
        case 'forever_loop': resolve('🔁 Loop started...'); break;
        case 'set_color': resolve('🎨 Color set!'); break;
        case 'draw_arc': resolve('⭕ Arc drawn!'); break;
        case 'draw_line': resolve('📏 Line drawn!'); break;
        case 'print_text': resolve('📝 Text printed!'); break;
        case 'ask_input': resolve('❓ Waiting for input...'); break;
        case 'set_variable': resolve('📦 Variable set!'); break;
        case 'if_else': resolve('🔀 Checking condition...'); break;
        case 'html_heading': resolve('📝 Heading added!'); break;
        case 'html_paragraph': resolve('📄 Paragraph added!'); break;
        case 'html_image': resolve('🖼️ Image added!'); break;
        case 'html_list': resolve('📋 List added!'); break;
        default: resolve(`⚙️ Executed: ${action}`);
      }
    });
  };

  const resetRobot = () => {
    const robot = robotSpriteRef.current;
    if (!challenge) return;
    const stageType = getStageType(challenge);

    if (stageType === 'console') { setTerminalLines([]); terminalLinesRef.current = []; return; }
    if (stageType === 'web_preview') { setWebPreviewHtml([]); return; }

    // Clear all drawn graphics from canvas (for drawing challenges etc.)
    const app = pixiAppRef.current;
    if (app && stageType === 'drawing') {
      // Remove everything except the first few base elements and the robot/pen
      const children = [...app.stage.children];
      children.forEach((child: { destroy?: () => void }, i: number) => {
        // Keep first 2 (background elements like paper dots + color palette) and the robot
        if (i > 1 && child !== robot) {
          app.stage.removeChild(child);
          child.destroy?.();
        }
      });
    }

    if (!robot) return;

    const config = (challenge.stage_config || {}) as Record<string, unknown>;
    const spriteConfig = config.sprite as Record<string, unknown> | undefined;
    const startX = spriteConfig ? (spriteConfig.x as number) || 60 : 60;
    const startY = spriteConfig ? (spriteConfig.y as number) || 60 : 60;
    robot.position.set(startX, startY);
    robot.rotation = 0;
    robotStateRef.current = { x: startX, y: startY, direction: 0 };
    drawColorRef.current = 0xFF0000;
  };

  const resetRunResult = (): RunResult => {
    const r: RunResult = {
      blocksUsed: [], blockCount: 0, actionsPerformed: [], terminalOutput: [], webElements: [],
      reachedGoal: false, collectedCount: 0, arcsDrawn: 0, linesDrawn: 0, colorsUsed: new Set(),
      hasScoring: false, hasGameOver: false, usesVariable: false, usesInput: false, usesIf: false,
      usesLoop: false, printsGreeting: false, hasHeading: false, hasParagraph: false, hasList: false,
      charactersAnimated: 0, danceCount: 0,
    };
    runResultRef.current = r;
    return r;
  };

  const trackAction = (action: string, fields?: Record<string, string | number>) => {
    const r = runResultRef.current;
    r.actionsPerformed.push(action);
    if (action === 'collect') r.collectedCount++;
    if (action === 'dance') r.danceCount++;
    if (action === 'draw_arc') r.arcsDrawn++;
    if (action === 'draw_line') r.linesDrawn++;
    if (action === 'set_color') r.colorsUsed.add(fields?.COLOR as string || `color_${r.colorsUsed.size}`);
    if (action === 'add_score') r.hasScoring = true;
    if (action === 'game_over') r.hasGameOver = true;
    if (action === 'set_variable') r.usesVariable = true;
    if (action === 'ask_input') r.usesInput = true;
    if (action === 'if_else') r.usesIf = true;
    if (action === 'forever_loop') r.usesLoop = true;
    if (action === 'print_text') r.printsGreeting = true;
    if (action === 'html_heading') r.hasHeading = true;
    if (action === 'html_paragraph') r.hasParagraph = true;
    if (action === 'html_list') r.hasList = true;
    if (action === 'say_hello') r.actionsPerformed.push('wave');
    if (action === 'create_star' || action === 'create_asteroid') r.charactersAnimated++;
  };

  const validateSolution = (): { passed: boolean; messages: string[] } => {
    if (!challenge) return { passed: false, messages: ['No challenge loaded'] };
    const expected = challenge.expected_output || {};
    const r = runResultRef.current;
    const failures: string[] = [];
    const successes: string[] = [];

    // Check console output — check both terminalOutput and terminalLinesRef
    if (expected.console_output) {
      const expectedText = (expected.console_output as string).toLowerCase();
      const allOutput = [...r.terminalOutput, ...terminalLinesRef.current];
      const hasOutput = allOutput.some(line => line.toLowerCase().includes(expectedText));
      if (hasOutput) successes.push('✅ Correct output!');
      else failures.push(`❌ Expected output: "${expected.console_output}"`);
    }

    // Check goal reaching
    if (expected.reach_goal) {
      if (r.reachedGoal) successes.push('✅ Reached the goal!');
      else failures.push('❌ You need to reach the goal! Try moving to the ⭐');
    }

    // Check minimum blocks
    if (expected.min_blocks) {
      if (r.blockCount >= (expected.min_blocks as number)) successes.push(`✅ Used ${r.blockCount} blocks`);
      else failures.push(`❌ Use at least ${expected.min_blocks} blocks (you used ${r.blockCount})`);
    }

    // Check collected items
    if (expected.collected) {
      const needed = expected.collected as number;
      if (r.collectedCount >= needed) successes.push(`✅ Collected ${r.collectedCount} items!`);
      else failures.push(`❌ Collect ${needed} items (you got ${r.collectedCount})`);
    }

    // Check specific action
    if (expected.action) {
      const expectedAction = expected.action as string;
      const hasAction = r.actionsPerformed.includes(expectedAction) ||
        (expectedAction === 'wave' && r.actionsPerformed.includes('say_hello')) ||
        (expectedAction === 'dance' && r.danceCount > 0);
      if (hasAction) successes.push(`✅ ${expectedAction} performed!`);
      else failures.push(`❌ You need to use the ${expectedAction} action`);
    }

    // Check repeat count (dance challenges)
    if (expected.repeat_count) {
      const needed = expected.repeat_count as number;
      if (r.danceCount >= needed) successes.push(`✅ Danced ${r.danceCount} times!`);
      else failures.push(`❌ Dance ${needed} times (you did ${r.danceCount})`);
    }

    // Check drawing
    if (expected.arcs_drawn) {
      if (r.arcsDrawn >= (expected.arcs_drawn as number)) successes.push('✅ Arcs drawn!');
      else failures.push(`❌ Draw ${expected.arcs_drawn} arcs (you drew ${r.arcsDrawn})`);
    }
    if (expected.colors_used) {
      if (r.colorsUsed.size >= (expected.colors_used as number)) successes.push('✅ Colors used!');
      else failures.push(`❌ Use ${expected.colors_used} colors (you used ${r.colorsUsed.size})`);
    }

    // Check game mechanics
    if (expected.has_scoring && !r.hasScoring) failures.push('❌ Add scoring to your game');
    if (expected.has_game_over && !r.hasGameOver) failures.push('❌ Add a game over condition');
    if (expected.has_scoring && r.hasScoring) successes.push('✅ Scoring added!');
    if (expected.has_game_over && r.hasGameOver) successes.push('✅ Game over added!');

    // Check console/code challenges
    if (expected.uses_variable) {
      if (r.usesVariable) successes.push('✅ Variable used!');
      else failures.push('❌ Use a variable block');
    }
    if (expected.uses_input) {
      if (r.usesInput) successes.push('✅ Input used!');
      else failures.push('❌ Use an input block');
    }
    if (expected.uses_if) {
      if (r.usesIf) successes.push('✅ If/else used!');
      else failures.push('❌ Use an if/else block');
    }
    if (expected.uses_loop) {
      if (r.usesLoop) successes.push('✅ Loop used!');
      else failures.push('❌ Use a loop block');
    }
    if (expected.prints_greeting) {
      if (r.printsGreeting) successes.push('✅ Greeting printed!');
      else failures.push('❌ Print a greeting message');
    }

    // Check web preview
    if (expected.has_heading) {
      if (r.hasHeading) successes.push('✅ Heading added!');
      else failures.push('❌ Add a heading');
    }
    if (expected.has_paragraph) {
      if (r.hasParagraph) successes.push('✅ Paragraph added!');
      else failures.push('❌ Add a paragraph');
    }
    if (expected.has_list) {
      if (r.hasList) successes.push('✅ List added!');
      else failures.push('❌ Add a list');
    }

    // Check shape (square)
    if (expected.shape === 'square') {
      const turns = r.actionsPerformed.filter(a => a === 'turn_right' || a === 'turn_left').length;
      const moves = r.actionsPerformed.filter(a => a === 'move_forward').length;
      if (turns >= 4 && moves >= 4) successes.push('✅ Square drawn!');
      else failures.push('❌ Draw a square: 4 sides and 4 turns');
    }

    // Check controls
    if (expected.controls) {
      const needed = expected.controls as string[];
      const has = needed.every(c =>
        r.actionsPerformed.includes(`when_arrow_${c}`) || r.actionsPerformed.includes(`move_${c}`)
      );
      if (has) successes.push('✅ Controls set up!');
      else failures.push(`❌ Set up ${needed.join(' and ')} controls`);
    }

    // Check animation
    if (expected.characters_animated) {
      if (r.charactersAnimated >= (expected.characters_animated as number)) successes.push('✅ Characters animated!');
      else failures.push(`❌ Animate ${expected.characters_animated} characters`);
    }

    // If no specific checks matched, check that blocks were used
    if (Object.keys(expected).length === 0 || (successes.length === 0 && failures.length === 0)) {
      if (r.blockCount > 0) return { passed: true, messages: ['✅ All blocks executed!'] };
      return { passed: false, messages: ['❌ Add some blocks first!'] };
    }

    const passed = failures.length === 0;
    return { passed, messages: [...successes, ...failures] };
  };

  const handleRun = async () => {
    const blockSequence = getBlockSequence();
    if (blockSequence.length === 0) {
      setOutput(['⚠️ No blocks in workspace! Drag some blocks first.']);
      setValidated(false);
      return;
    }

    setIsRunning(true);
    setValidated(false);
    const result = resetRunResult();
    result.blocksUsed = [...blockSequence];
    result.blockCount = getBlockCount();
    // Check if any repeat blocks were used
    const tree = getBlockTree();
    const hasRepeat = tree.some(n => n.type === 'controls_repeat_ext' || n.type === 'controls_repeat');
    if (hasRepeat) result.usesLoop = true;

    setOutput([`▶️ Running ${result.blockCount} block${result.blockCount > 1 ? 's' : ''}...`]);
    resetRobot();
    await new Promise(r => setTimeout(r, 300));

    // Auto-scroll to game stage on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('game-stage')?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }

    const executionNodes = getExecutionSequence();
    for (const node of executionNodes) {
      trackAction(node.type, node.fields);
      const msg = await animateStepNode(node);
      if (msg) {
        setOutput(prev => [...prev, msg]);
        if (msg.includes('>>>') || msg.includes('Printed') || msg.includes('Hello')) {
          result.terminalOutput.push(msg);
        }
      }
      await new Promise(r => setTimeout(r, 100));
    }

    // Check goal reaching for movement challenges
    const config = (challenge?.stage_config || {}) as Record<string, unknown>;
    const goal = config.goal as Record<string, unknown> | undefined;
    if (goal) {
      const gx = (goal.x as number) || 350;
      const gy = (goal.y as number) || 200;
      const dist = Math.sqrt(Math.pow(robotStateRef.current.x - gx, 2) + Math.pow(robotStateRef.current.y - gy, 2));
      result.reachedGoal = dist < GRID_SIZE * 1.5;
    }

    // Also track terminal lines for console output matching
    result.terminalOutput = [...result.terminalOutput, ...terminalLinesRef.current];

    // Validate against expected output
    const validation = validateSolution();
    setValidated(validation.passed);

    // Show validation results
    setOutput(prev => [...prev, '─────────────────', ...validation.messages]);
    if (validation.passed) {
      setOutput(prev => [...prev, '🎉 Great job! Click "Done!" to complete the challenge!']);
    } else {
      setOutput(prev => [...prev, '💡 Keep trying! Modify your blocks and run again.']);
    }
    setIsRunning(false);
  };

  const handleComplete = async () => {
    if (!challenge) return;
    if (!validated) {
      setOutput(prev => [...prev, '⚠️ Run your code first and make sure it passes all checks!']);
      return;
    }
    const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
    try {
      await kidsApi.submitProgress({ challenge_id: challenge.id, completed: true, time_spent_seconds: timeSpent, workspace_json: {} });
    } catch (e) { console.warn('Progress save failed:', e); }
    setCompleted(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl animate-spin mb-4" style={{ animationDuration: '3s' }}>🔧</div>
          <p className="text-gray-500 text-lg">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-gray-500 text-lg">{error || 'Challenge not found'}</p>
        <a href="/kids/challenges" className="text-orange-500 hover:underline mt-4 inline-block text-lg font-semibold">← Back to Challenges</a>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md bg-white rounded-3xl p-10 shadow-xl border-4 border-orange-200">
          <div className="text-7xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-3xl font-bold font-[Manrope] mb-2">Amazing!</h2>
          <p className="text-gray-600 mb-2">You completed <strong>{challenge.title}</strong>!</p>
          <p className="text-2xl font-bold text-orange-500 mb-6">+{challenge.points} points! ⭐</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="/kids/challenges" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors">Next Challenge →</a>
            <a href="/kids/dashboard" className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">My Progress 📊</a>
          </div>
        </div>
      </div>
    );
  }

  const stageType = getStageType(challenge);

  const stageHeaderLabel = stageType === 'console' ? '💻 Terminal' :
    stageType === 'drawing' ? '🎨 Drawing Canvas' :
    stageType === 'platformer' ? '🐸 Platformer' :
    stageType === 'game' ? '🚀 Space Game' :
    stageType === 'maze' ? '🐭 Maze' :
    stageType === 'web_preview' ? '🌐 Web Preview' :
    '🎮 Game Stage';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-4">
        <a href="/kids/challenges" className="text-gray-400 hover:text-orange-500 transition-colors text-sm mb-2 inline-block">← Back</a>
        <div className="flex items-center gap-3">
          <span className="text-3xl md:text-4xl shrink-0">{challenge.icon_emoji}</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-2xl font-bold font-[Manrope] leading-tight">{challenge.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{challenge.course_title} → {challenge.lesson_title}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                challenge.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {challenge.difficulty === 'easy' ? '⭐ Easy' : challenge.difficulty === 'medium' ? '⭐⭐ Medium' : '⭐⭐⭐ Hard'}
              </span>
              <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-semibold">+{challenge.points} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
        <div className="text-blue-800 whitespace-pre-line text-sm leading-relaxed">
          {challenge.instructions.split('\n').map((line, i) => (
            <p key={i} className={line.startsWith('🎯') ? 'font-bold text-base mb-2' : 'mb-1'}>{line}</p>
          ))}
        </div>
        {challenge.hints?.length > 0 && (
          <button onClick={() => { setShowHint(!showHint); setCurrentHint(0); }}
            className="text-blue-500 text-sm mt-3 hover:underline font-medium">
            {showHint ? '🙈 Hide hints' : '💡 Need a hint?'}
          </button>
        )}
        {showHint && challenge.hints[currentHint] && (
          <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="text-yellow-800 text-sm">💡 {challenge.hints[currentHint]}</p>
            {currentHint < challenge.hints.length - 1 && (
              <button onClick={() => setCurrentHint(h => h + 1)} className="text-yellow-600 text-xs mt-1 hover:underline font-medium">Next hint →</button>
            )}
          </div>
        )}
      </div>

      {/* Main workspace */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Blockly Editor */}
        <div className="bg-white rounded-2xl border-2 border-orange-100 overflow-hidden shadow-sm">
          {/* Desktop top bar */}
          <div className="hidden md:flex bg-orange-50 px-3 py-2 border-b border-orange-100 items-center justify-between">
            <span className="font-semibold text-sm text-gray-700">🧩 Workspace</span>
            <div className="flex gap-2">
              <button onClick={handleRun} disabled={isRunning}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">
                {isRunning ? '⏳...' : '▶️ Run'}
              </button>
              <button onClick={() => { resetRobot(); setOutput([]); }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                🔄 Reset
              </button>
              <button onClick={handleComplete}
                className={`${validated ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-300 cursor-not-allowed'} text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors`}
                title={validated ? 'Submit your solution!' : 'Run your code and pass all checks first'}>
                {validated ? '✅ Done!' : '🔒 Done'}
              </button>
            </div>
          </div>
          {/* Mobile action bar */}
          <div className="flex md:hidden bg-orange-50 px-2 py-2 border-b border-orange-100 items-center justify-between gap-1">
            <button onClick={() => setShowMobileBlocks(!showMobileBlocks)}
              className={`${showMobileBlocks ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-orange-200'} px-3 py-2 rounded-xl text-sm font-bold transition-colors flex-1`}>
              🧩 Blocks
            </button>
            <button onClick={handleRun} disabled={isRunning}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex-1">
              {isRunning ? '⏳...' : '▶️ Run'}
            </button>
            <button onClick={() => { resetRobot(); setOutput([]); setValidated(false); }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-xl text-sm font-bold transition-colors flex-1">
              🔄 Reset
            </button>
            <button onClick={() => { if (workspaceRef.current) { workspaceRef.current.clear(); setOutput([]); setValidated(false); } }}
              className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-xl text-sm font-bold transition-colors flex-1">
              🗑️ Clear
            </button>
          </div>
          {/* Mobile blocks overlay */}
          {showMobileBlocks && (
            <div className="md:hidden bg-orange-50 border-b border-orange-200 p-3 max-h-48 overflow-y-auto">
              {categories.length > 1 && (
                <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1">
                  {categories.map((cat, i) => {
                    const hue = parseInt(cat.colour) || 0;
                    const bgColor = `hsl(${hue}, 70%, 45%)`;
                    return (
                      <button key={i} onClick={() => switchCategory(i)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                          activeCategory === i
                            ? 'text-white shadow-md ring-2 ring-offset-1'
                            : 'text-gray-600 bg-white border border-gray-200 hover:border-gray-300'
                        }`}
                        style={activeCategory === i ? { backgroundColor: bgColor } : {}}>
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {availableBlocks.map((block) => (
                  <button key={block.type} onClick={() => addBlock(block.type)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-white shadow-sm active:scale-95 transition-transform"
                    style={{ backgroundColor: `hsl(${block.colour}, 60%, 45%)` }}>
                    {block.label}
                  </button>
                ))}
                {availableBlocks.length === 0 && (
                  <p className="text-gray-400 text-xs">No blocks available</p>
                )}
              </div>
            </div>
          )}
          {/* Category tabs for multi-category toolboxes */}
          {categories.length > 1 && (
            <div className="flex gap-1.5 px-3 py-1.5 bg-orange-50/50 border-b border-orange-100 overflow-x-auto">
              {categories.map((cat, i) => {
                const hue = parseInt(cat.colour) || 0;
                const bgColor = `hsl(${hue}, 70%, 45%)`;
                return (
                  <button key={i} onClick={() => switchCategory(i)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      activeCategory === i
                        ? 'text-white shadow-md'
                        : 'text-gray-600 bg-white border border-gray-200 hover:border-gray-300'
                    }`}
                    style={activeCategory === i ? { backgroundColor: bgColor } : {}}>
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
          {/* Blockly workspace with built-in flyout toolbox */}
          <div ref={blocklyRef} style={{ height: '450px', width: '100%', position: 'relative' }} />
          {!blocklyReady && (
            <div style={{ height: '450px', marginTop: '-450px', position: 'relative' }}
              className="flex items-center justify-center bg-orange-50/80">
              <div className="text-center">
                <div className="text-4xl animate-pulse mb-2">🧩</div>
                <p className="text-gray-500 text-sm">Loading workspace...</p>
              </div>
            </div>
          )}
        </div>

        {/* Right panel: stage varies by type */}
        <div id="game-stage" className="bg-white rounded-2xl border-2 border-orange-100 overflow-hidden shadow-sm flex flex-col">
          <div className="bg-orange-50 px-4 py-2.5 border-b border-orange-100 flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-700">{stageHeaderLabel}</span>
            {stageType !== 'console' && stageType !== 'web_preview' && (
              <span className="text-xs text-gray-400">
                📍 ({Math.round(robotStateRef.current.x)}, {Math.round(robotStateRef.current.y)})
              </span>
            )}
          </div>

          {/* CONSOLE TYPE: Terminal UI */}
          {stageType === 'console' && (
            <div ref={terminalRef} className="p-0" style={{ minHeight: '320px' }}>
              <div className="bg-gray-950 rounded-b-none p-4 font-mono text-sm" style={{ minHeight: '320px' }}>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-800">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-500 text-xs ml-2">Python Console</span>
                </div>
                {terminalLines.map((line, i) => (
                  <p key={i} className="text-green-400 leading-relaxed">{line}</p>
                ))}
                {terminalLines.length === 0 && (
                  <p className="text-green-600 opacity-60">Waiting for program output...</p>
                )}
                <span className="text-green-400 animate-pulse">▌</span>
              </div>
            </div>
          )}

          {/* WEB PREVIEW TYPE: Mini browser */}
          {stageType === 'web_preview' && (
            <div style={{ minHeight: '320px' }}>
              <div className="bg-gray-200 px-3 py-1.5 flex items-center gap-2 border-b">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white rounded px-2 py-0.5 text-xs text-gray-500 ml-2">
                  https://my-page.example.com
                </div>
              </div>
              <div className="bg-white p-4" style={{ minHeight: '280px' }}>
                {webPreviewHtml.length === 0 ? (
                  <div className="text-gray-300 text-center mt-16">
                    <div className="text-4xl mb-2">🌐</div>
                    <p className="text-sm">Your web page will appear here</p>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: webPreviewHtml.join('\n') }}
                  />
                )}
              </div>
            </div>
          )}

          {/* CANVAS TYPES: PixiJS */}
          {stageType !== 'console' && stageType !== 'web_preview' && (
            <div className="flex items-center justify-center p-3" style={{
              backgroundColor: stageType === 'game' ? '#0B0B2A' :
                stageType === 'platformer' ? '#E0F2FE' :
                stageType === 'maze' ? '#F5E6D3' :
                stageType === 'drawing' ? '#FFFFFF' :
                '#FFFBEB'
            }}>
              <canvas ref={canvasRef} className="rounded-xl border border-orange-200" style={{ maxWidth: '100%', display: 'block' }} />
            </div>
          )}

          {/* Result panel — always visible, grows to fill remaining space */}
          <div className="border-t border-orange-100 p-3 bg-gray-900 overflow-y-auto flex-1" style={{ minHeight: '80px' }}>
            {output.length === 0 ? (
              <div className="flex items-center gap-2 text-gray-500">
                <span className="text-lg">📋</span>
                <div>
                  <p className="text-sm font-semibold text-gray-400">Result</p>
                  <p className="text-xs text-gray-600">Press ▶️ Run to see your code in action!</p>
                </div>
              </div>
            ) : (
              output.map((line, i) => (
                <p key={i} className={`text-sm font-mono leading-relaxed ${
                  line.includes('🎉') || line.includes('✅') ? 'text-green-400' :
                  line.includes('❌') ? 'text-red-400' :
                  line.includes('⚠️') || line.includes('💡') ? 'text-yellow-400' :
                  line.includes('▶️') ? 'text-blue-400' :
                  line.includes('─') ? 'text-gray-600' :
                  'text-green-300'
                }`}>{line}</p>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom action bar: Done + Next Challenge */}
      <div className="md:hidden flex gap-3 mb-4">
        <button onClick={handleComplete}
          disabled={!validated}
          className={`flex-1 py-3 rounded-xl text-base font-bold transition-colors ${
            validated
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}>
          {validated ? '✅ Done!' : '🔒 Done'}
        </button>
        <a href="/kids/challenges"
          className="flex-1 py-3 rounded-xl text-base font-bold text-center bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-colors">
          Next Challenge →
        </a>
      </div>

      {challenge.description && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-gray-600 text-sm">
          <p>{challenge.description}</p>
        </div>
      )}
    </div>
  );
}
