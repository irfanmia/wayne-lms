from django.core.management.base import BaseCommand
from apps.kids_curriculum.models import KidCourse, KidLesson, KidChallenge


class Command(BaseCommand):
    help = 'Seed comprehensive kids coding content'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing kids content first')

    def handle(self, *args, **options):
        if options['clear']:
            KidChallenge.objects.all().delete()
            KidLesson.objects.all().delete()
            KidCourse.objects.all().delete()
            self.stdout.write('Cleared existing kids content.')

        courses_data = [
            # ──────────────────────────────────────────────
            # COURSE 1: Code Adventures (Ages 5-7)
            # ──────────────────────────────────────────────
            {
                'title': 'Code Adventures',
                'slug': 'code-adventures',
                'age_group': '5-7',
                'description': 'Join Robo the Robot on an exciting coding adventure! Learn to give instructions using colorful code blocks. No reading required — just drag, drop, and play!',
                'icon_emoji': '🚀',
                'color': '#F97316',
                'status': 'published',
                'order': 1,
                'lessons': [
                    {
                        'title': 'Meet Robo!',
                        'slug': 'meet-robo',
                        'order': 1,
                        'icon_emoji': '🤖',
                        'description': 'Say hello to your new coding buddy and learn how to give your first instructions!',
                        'intro_text': '👋 Hi there! I\'m Robo, your coding buddy! I love to move around and explore. But I can\'t do anything on my own — I need YOUR help! You\'ll drag colorful blocks to tell me what to do. Ready? Let\'s go!',
                        'challenges': [
                            {
                                'title': 'Say Hello to Robo',
                                'slug': 'say-hello',
                                'difficulty': 'easy',
                                'challenge_type': 'blocks',
                                'points': 10,
                                'order': 1,
                                'icon_emoji': '👋',
                                'description': 'Your very first coding challenge! Drag one block to make Robo wave hello.',
                                'instructions': '🎯 **Goal:** Make Robo wave hello!\n\n1. Look at the blocks on the left side\n2. Find the block that says "👋 Wave Hello"\n3. Drag it into the workspace area\n4. Press the green ▶️ Play button\n5. Watch Robo wave at you! 🎉',
                                'hints': [
                                    '👀 Look for the orange block with a waving hand!',
                                    '🖱️ Click and hold the block, then drag it to the right side',
                                    '▶️ Don\'t forget to press the Play button to see Robo wave!'
                                ],
                                'toolbox_json': {
                                    'kind': 'flyoutToolbox',
                                    'contents': [
                                        {'kind': 'block', 'type': 'say_hello'},
                                        {'kind': 'block', 'type': 'dance'},
                                        {'kind': 'block', 'type': 'move_forward'},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#87CEEB',
                                    'backgroundType': 'color',
                                    'sprite': {'type': 'robot', 'emoji': '🤖', 'x': 200, 'y': 200, 'scale': 2},
                                    'gridSize': 5,
                                    'showGrid': True,
                                },
                                'expected_output': {'action': 'wave', 'blocks_used': 1},
                            },
                            {
                                'title': 'Move Robo Forward',
                                'slug': 'move-forward',
                                'difficulty': 'easy',
                                'challenge_type': 'blocks',
                                'points': 10,
                                'order': 2,
                                'icon_emoji': '➡️',
                                'description': 'Help Robo take its first steps! Use the Move Forward block to walk across the screen.',
                                'instructions': '🎯 **Goal:** Make Robo walk to the star! ⭐\n\n1. Find the "➡️ Move Forward" block\n2. Drag it into the workspace\n3. Press ▶️ Play\n4. Robo moves one step forward!\n5. Add MORE Move Forward blocks to reach the star',
                                'hints': [
                                    '➡️ The blue arrow block makes Robo move one step',
                                    '⭐ Count how many steps to the star — you need that many blocks!',
                                    '📦 You can stack blocks on top of each other!'
                                ],
                                'toolbox_json': {
                                    'kind': 'flyoutToolbox',
                                    'contents': [
                                        {'kind': 'block', 'type': 'move_forward'},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#90EE90',
                                    'backgroundType': 'color',
                                    'sprite': {'type': 'robot', 'emoji': '🤖', 'x': 50, 'y': 200, 'scale': 1.5},
                                    'goal': {'emoji': '⭐', 'x': 350, 'y': 200},
                                    'gridSize': 5,
                                    'showGrid': True,
                                },
                                'expected_output': {'reach_goal': True, 'min_blocks': 3},
                            },
                            {
                                'title': 'Turn and Explore',
                                'slug': 'turn-and-explore',
                                'difficulty': 'easy',
                                'challenge_type': 'blocks',
                                'points': 15,
                                'order': 3,
                                'icon_emoji': '🔄',
                                'description': 'Learn to turn! Make Robo change direction to navigate around obstacles.',
                                'instructions': '🎯 **Goal:** Make Robo go around the wall to reach the treasure! 💎\n\n1. Robo can\'t walk through the wall 🧱\n2. Use "➡️ Move Forward" to walk\n3. Use "🔄 Turn Right" to change direction\n4. Find the path around the wall!\n\n💡 Think: Move → Turn → Move!',
                                'hints': [
                                    '🧱 You can\'t go through the wall — go around it!',
                                    '🔄 Turn Right makes Robo face a new direction',
                                    '💡 Try: Move Forward, Turn Right, Move Forward'
                                ],
                                'toolbox_json': {
                                    'kind': 'flyoutToolbox',
                                    'contents': [
                                        {'kind': 'block', 'type': 'move_forward'},
                                        {'kind': 'block', 'type': 'turn_right'},
                                        {'kind': 'block', 'type': 'turn_left'},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#90EE90',
                                    'backgroundType': 'color',
                                    'sprite': {'type': 'robot', 'emoji': '🤖', 'x': 50, 'y': 100, 'scale': 1.5},
                                    'obstacles': [{'emoji': '🧱', 'x': 150, 'y': 100}],
                                    'goal': {'emoji': '💎', 'x': 350, 'y': 200},
                                    'gridSize': 5,
                                    'showGrid': True,
                                },
                                'expected_output': {'reach_goal': True, 'avoid_obstacles': True},
                            },
                        ]
                    },
                    {
                        'title': 'Loops are Fun!',
                        'slug': 'loops-fun',
                        'order': 2,
                        'icon_emoji': '🔁',
                        'description': 'Why write the same thing 10 times when you can use a loop? Learn the superpower of repeating!',
                        'intro_text': '🔁 Imagine you want Robo to jump 10 times. Would you drag 10 jump blocks? That\'s a LOT of work! Instead, we can use a special block called a LOOP. A loop says "do this thing X times." It\'s like magic! ✨',
                        'challenges': [
                            {
                                'title': 'Repeat the Dance',
                                'slug': 'repeat-dance',
                                'difficulty': 'medium',
                                'challenge_type': 'blocks',
                                'points': 20,
                                'order': 1,
                                'icon_emoji': '💃',
                                'description': 'Use a loop to make Robo dance multiple times without repeating blocks!',
                                'instructions': '🎯 **Goal:** Make Robo dance 4 times!\n\n1. Find the "🔁 Repeat" block (it looks like a bracket)\n2. Put the "💃 Dance" block INSIDE the repeat block\n3. Change the number to 4\n4. Press ▶️ Play and watch Robo groove! 🕺\n\n💡 Without a loop, you\'d need 4 dance blocks. With a loop, just 1!',
                                'hints': [
                                    '🔁 The Repeat block has a number — change it to 4!',
                                    '📦 Put the Dance block INSIDE the Repeat block',
                                    '💡 The block should look like: Repeat [4] times → Dance'
                                ],
                                'toolbox_json': {
                                    'kind': 'flyoutToolbox',
                                    'contents': [
                                        {'kind': 'block', 'type': 'controls_repeat_ext', 'inputs': {'TIMES': {'shadow': {'type': 'math_number', 'fields': {'NUM': 3}}}}},
                                        {'kind': 'block', 'type': 'dance'},
                                        {'kind': 'block', 'type': 'move_forward'},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#1a1a2e',
                                    'backgroundType': 'color',
                                    'sprite': {'type': 'robot', 'emoji': '🤖', 'x': 200, 'y': 200, 'scale': 2},
                                    'effects': ['disco_lights', 'sparkles'],
                                },
                                'expected_output': {'action': 'dance', 'repeat_count': 4},
                            },
                            {
                                'title': 'Walk the Square',
                                'slug': 'walk-square',
                                'difficulty': 'medium',
                                'challenge_type': 'blocks',
                                'points': 25,
                                'order': 2,
                                'icon_emoji': '⬜',
                                'description': 'Use a loop to make Robo walk in a perfect square — move and turn, 4 times!',
                                'instructions': '🎯 **Goal:** Make Robo walk in a square shape! ⬜\n\nA square has 4 sides. For each side:\n1. Move Forward (walk one side)\n2. Turn Right (turn the corner)\n\n💡 Instead of 8 blocks, use a Repeat 4 loop with Move + Turn inside!\n\nThis is the SAME pattern repeated 4 times. Perfect for a loop!',
                                'hints': [
                                    '⬜ A square = Move Forward + Turn Right, done 4 times',
                                    '🔁 Put BOTH Move Forward AND Turn Right inside the Repeat block',
                                    '4️⃣ Set the repeat number to 4 (because a square has 4 sides)'
                                ],
                                'toolbox_json': {
                                    'kind': 'flyoutToolbox',
                                    'contents': [
                                        {'kind': 'block', 'type': 'controls_repeat_ext', 'inputs': {'TIMES': {'shadow': {'type': 'math_number', 'fields': {'NUM': 4}}}}},
                                        {'kind': 'block', 'type': 'move_forward'},
                                        {'kind': 'block', 'type': 'turn_right'},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#F0F9FF',
                                    'backgroundType': 'color',
                                    'sprite': {'type': 'robot', 'emoji': '🤖', 'x': 100, 'y': 100, 'scale': 1.5},
                                    'drawTrail': True,
                                    'gridSize': 8,
                                    'showGrid': True,
                                },
                                'expected_output': {'shape': 'square', 'sides': 4},
                            },
                        ]
                    },
                    {
                        'title': 'Collect the Gems!',
                        'slug': 'collect-gems',
                        'order': 3,
                        'icon_emoji': '💎',
                        'description': 'Put together everything you\'ve learned — move, turn, and loop to collect all the gems!',
                        'intro_text': '💎 Robo found a cave full of gems! Help Robo collect all of them using your coding skills. You\'ll need to move, turn, AND use loops. You\'ve got this! 💪',
                        'challenges': [
                            {
                                'title': 'Gem Path',
                                'slug': 'gem-path',
                                'difficulty': 'easy',
                                'challenge_type': 'puzzle',
                                'points': 15,
                                'order': 1,
                                'icon_emoji': '💎',
                                'description': 'Guide Robo along a straight path to pick up 3 gems!',
                                'instructions': '🎯 **Goal:** Collect all 3 gems! 💎💎💎\n\nThe gems are in a straight line. Just keep moving forward!\n\n1. Use 3 "Move Forward" blocks\n2. Robo picks up each gem automatically when it walks over it\n3. Collect all 3 to win!',
                                'hints': [
                                    '💎 The gems are in a straight line — just go forward!',
                                    '3️⃣ You need exactly 3 Move Forward blocks',
                                    '🔁 Or use a Repeat 3 loop with Move Forward inside!'
                                ],
                                'toolbox_json': {
                                    'kind': 'flyoutToolbox',
                                    'contents': [
                                        {'kind': 'block', 'type': 'move_forward'},
                                        {'kind': 'block', 'type': 'controls_repeat_ext', 'inputs': {'TIMES': {'shadow': {'type': 'math_number', 'fields': {'NUM': 3}}}}},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#4a3728',
                                    'backgroundType': 'color',
                                    'sprite': {'type': 'robot', 'emoji': '🤖', 'x': 50, 'y': 200, 'scale': 1.5},
                                    'collectibles': [
                                        {'emoji': '💎', 'x': 150, 'y': 200},
                                        {'emoji': '💎', 'x': 250, 'y': 200},
                                        {'emoji': '💎', 'x': 350, 'y': 200},
                                    ],
                                },
                                'expected_output': {'collected': 3},
                            },
                            {
                                'title': 'Zigzag Gems',
                                'slug': 'zigzag-gems',
                                'difficulty': 'medium',
                                'challenge_type': 'puzzle',
                                'points': 25,
                                'order': 2,
                                'icon_emoji': '⚡',
                                'description': 'Navigate a zigzag path to collect gems placed at each turn!',
                                'instructions': '🎯 **Goal:** Collect all 4 gems in a zigzag! ⚡\n\nThe gems are placed in a zigzag pattern:\n- Move forward to gem 1 💎\n- Turn right, move to gem 2 💎\n- Turn left, move to gem 3 💎\n- Turn right, move to gem 4 💎\n\n💡 See the pattern? Move → Turn → Move → Turn!',
                                'hints': [
                                    '⚡ Zigzag means: go forward, turn, go forward, turn the OTHER way',
                                    '🔄 Alternate between Turn Right and Turn Left',
                                    '💡 Pattern: Move, Turn Right, Move, Turn Left, Move, Turn Right, Move'
                                ],
                                'toolbox_json': {
                                    'kind': 'flyoutToolbox',
                                    'contents': [
                                        {'kind': 'block', 'type': 'move_forward'},
                                        {'kind': 'block', 'type': 'turn_right'},
                                        {'kind': 'block', 'type': 'turn_left'},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#4a3728',
                                    'backgroundType': 'color',
                                    'sprite': {'type': 'robot', 'emoji': '🤖', 'x': 50, 'y': 100, 'scale': 1.5},
                                    'collectibles': [
                                        {'emoji': '💎', 'x': 150, 'y': 100},
                                        {'emoji': '💎', 'x': 150, 'y': 200},
                                        {'emoji': '💎', 'x': 250, 'y': 200},
                                        {'emoji': '💎', 'x': 250, 'y': 300},
                                    ],
                                },
                                'expected_output': {'collected': 4},
                            },
                            {
                                'title': 'Gem Maze',
                                'slug': 'gem-maze',
                                'difficulty': 'hard',
                                'challenge_type': 'puzzle',
                                'points': 35,
                                'order': 3,
                                'icon_emoji': '🏆',
                                'description': 'The ultimate challenge! Navigate a maze with walls to collect all 5 gems and reach the treasure chest!',
                                'instructions': '🎯 **Goal:** Collect all 5 gems and reach the treasure chest! 🏆\n\n🧱 Watch out for walls — you can\'t walk through them!\n📐 Plan your path carefully before you start\n🔁 Use loops where you see repeating patterns\n\nThis is the BOSS LEVEL! You can do it! 💪',
                                'hints': [
                                    '🗺️ Look at the whole maze first before placing blocks',
                                    '🔁 If you see the same move repeated, use a loop!',
                                    '🧱 Count your steps carefully to avoid hitting walls',
                                    '💡 There are TWO possible paths — find the shorter one!'
                                ],
                                'toolbox_json': {
                                    'kind': 'flyoutToolbox',
                                    'contents': [
                                        {'kind': 'block', 'type': 'move_forward'},
                                        {'kind': 'block', 'type': 'turn_right'},
                                        {'kind': 'block', 'type': 'turn_left'},
                                        {'kind': 'block', 'type': 'controls_repeat_ext', 'inputs': {'TIMES': {'shadow': {'type': 'math_number', 'fields': {'NUM': 3}}}}},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#4a3728',
                                    'backgroundType': 'color',
                                    'sprite': {'type': 'robot', 'emoji': '🤖', 'x': 50, 'y': 50, 'scale': 1.5},
                                    'obstacles': [
                                        {'emoji': '🧱', 'x': 100, 'y': 150},
                                        {'emoji': '🧱', 'x': 200, 'y': 50},
                                        {'emoji': '🧱', 'x': 200, 'y': 150},
                                        {'emoji': '🧱', 'x': 300, 'y': 250},
                                    ],
                                    'collectibles': [
                                        {'emoji': '💎', 'x': 100, 'y': 50},
                                        {'emoji': '💎', 'x': 100, 'y': 250},
                                        {'emoji': '💎', 'x': 200, 'y': 250},
                                        {'emoji': '💎', 'x': 300, 'y': 150},
                                        {'emoji': '💎', 'x': 350, 'y': 50},
                                    ],
                                    'goal': {'emoji': '🏆', 'x': 350, 'y': 300},
                                },
                                'expected_output': {'collected': 5, 'reach_goal': True},
                            },
                        ]
                    },
                ]
            },

            # ──────────────────────────────────────────────
            # COURSE 2: Game Builder (Ages 8-10)
            # ──────────────────────────────────────────────
            {
                'title': 'Game Builder',
                'slug': 'game-builder',
                'age_group': '8-10',
                'description': 'Create your own video games with code blocks! Build games you can actually play — from catching stars to dodging obstacles. Share your games with friends!',
                'icon_emoji': '🎮',
                'color': '#8B5CF6',
                'status': 'published',
                'order': 2,
                'lessons': [
                    {
                        'title': 'Your First Game',
                        'slug': 'first-game',
                        'order': 1,
                        'icon_emoji': '🕹️',
                        'description': 'Build a simple game where a character moves around the screen using arrow keys!',
                        'intro_text': '🎮 Time to build your FIRST video game! We\'ll start simple — make a character that you can control with arrow keys. Every great game developer started exactly where you are right now!',
                        'challenges': [
                            {
                                'title': 'Moving the Player',
                                'slug': 'moving-player',
                                'difficulty': 'easy',
                                'challenge_type': 'game',
                                'points': 15,
                                'order': 1,
                                'icon_emoji': '🏃',
                                'description': 'Set up keyboard controls! Make your character move left and right with arrow keys.',
                                'instructions': '🎯 **Goal:** Control the spaceship with arrow keys! 🚀\n\n1. Find the "⌨️ When Key Pressed" block\n2. Set it to "Left Arrow"\n3. Add "⬅️ Move Left" inside it\n4. Do the same for Right Arrow\n5. Press ▶️ Play and use your arrow keys!\n\n🎮 You\'re making a REAL game!',
                                'hints': [
                                    '⌨️ You need TWO "When Key Pressed" blocks — one for left, one for right',
                                    '⬅️ Put "Move Left" inside the Left Arrow event',
                                    '➡️ Put "Move Right" inside the Right Arrow event'
                                ],
                                'toolbox_json': {
                                    'kind': 'flyoutToolbox',
                                    'contents': [
                                        {'kind': 'block', 'type': 'when_arrow_left'},
                                        {'kind': 'block', 'type': 'when_arrow_right'},
                                        {'kind': 'block', 'type': 'move_left'},
                                        {'kind': 'block', 'type': 'move_right'},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#0a0a2a',
                                    'backgroundType': 'color',
                                    'sprite': {'type': 'spaceship', 'emoji': '🚀', 'x': 200, 'y': 350, 'scale': 2},
                                    'type': 'game',
                                    'controls': 'keyboard',
                                },
                                'expected_output': {'controls': ['left', 'right']},
                            },
                            {
                                'title': 'Catch the Stars',
                                'slug': 'catch-stars',
                                'difficulty': 'medium',
                                'challenge_type': 'game',
                                'points': 25,
                                'order': 2,
                                'icon_emoji': '⭐',
                                'description': 'Add falling stars and a score counter! Catch stars to earn points.',
                                'instructions': '🎯 **Goal:** Make stars fall and catch them for points! ⭐\n\n1. Use "🔁 Forever Loop" to keep the game running\n2. Inside the loop, add "⭐ Create Star" at a random position\n3. Add "⬇️ Move Down" to make the star fall\n4. Add "🤝 If Touching Player" to check if you caught it\n5. Inside the If block, add "+1 Score"!\n\n🏆 Try to catch 10 stars!',
                                'hints': [
                                    '🔁 The Forever Loop keeps the game going — everything inside repeats!',
                                    '🎲 "Random Position" means the star appears at a different spot each time',
                                    '🤝 The "If Touching" block checks if two things overlap'
                                ],
                                'toolbox_json': {
                                    'kind': 'categoryToolbox',
                                    'contents': [
                                        {'kind': 'category', 'name': 'Game', 'colour': '60', 'contents': [
                                            {'kind': 'block', 'type': 'create_star'},
                                            {'kind': 'block', 'type': 'if_touching'},
                                            {'kind': 'block', 'type': 'add_score'},
                                            {'kind': 'block', 'type': 'forever_loop'},
                                        ]},
                                        {'kind': 'category', 'name': 'Movement', 'colour': '230', 'contents': [
                                            {'kind': 'block', 'type': 'move_down'},
                                        ]},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#0a0a2a',
                                    'backgroundType': 'color',
                                    'sprite': {'type': 'spaceship', 'emoji': '🚀', 'x': 200, 'y': 350, 'scale': 2},
                                    'fallingItems': [
                                        {'emoji': '⭐', 'speed': 2, 'spawnRate': 60},
                                    ],
                                    'type': 'game',
                                    'scoreEnabled': True,
                                },
                                'expected_output': {'min_score': 5, 'game_mechanic': 'catch'},
                            },
                            {
                                'title': 'Dodge the Asteroids',
                                'slug': 'dodge-asteroids',
                                'difficulty': 'hard',
                                'challenge_type': 'game',
                                'points': 35,
                                'order': 3,
                                'icon_emoji': '☄️',
                                'description': 'Add danger! Asteroids fall alongside stars — catch stars but dodge asteroids!',
                                'instructions': '🎯 **Goal:** Build a complete game with stars AND asteroids! ☄️\n\n✅ Catch stars = +1 point ⭐\n❌ Hit asteroid = Game Over! ☄️\n\n1. Reuse your star-catching code\n2. Add "☄️ Create Asteroid" blocks too\n3. Add an "If Touching Asteroid → Game Over" check\n4. Add a "🏆 High Score" display\n\n🎮 This is a REAL game you can share with friends!',
                                'hints': [
                                    '☄️ Asteroids work just like stars but you need to AVOID them',
                                    '💥 Use "If Touching Asteroid" → "Game Over" block',
                                    '🏆 The High Score block remembers your best score!'
                                ],
                                'toolbox_json': {
                                    'kind': 'categoryToolbox',
                                    'contents': [
                                        {'kind': 'category', 'name': 'Game', 'colour': '60', 'contents': [
                                            {'kind': 'block', 'type': 'create_star'},
                                            {'kind': 'block', 'type': 'create_asteroid'},
                                            {'kind': 'block', 'type': 'if_touching'},
                                            {'kind': 'block', 'type': 'add_score'},
                                            {'kind': 'block', 'type': 'game_over'},
                                            {'kind': 'block', 'type': 'forever_loop'},
                                        ]},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#0a0a2a',
                                    'backgroundType': 'color',
                                    'sprite': {'type': 'spaceship', 'emoji': '🚀', 'x': 200, 'y': 350, 'scale': 2},
                                    'fallingItems': [
                                        {'emoji': '⭐', 'speed': 2, 'spawnRate': 60, 'points': 1},
                                        {'emoji': '☄️', 'speed': 3, 'spawnRate': 90, 'damage': True},
                                    ],
                                    'type': 'game',
                                    'scoreEnabled': True,
                                    'livesEnabled': True,
                                    'lives': 3,
                                },
                                'expected_output': {'game_complete': True, 'has_scoring': True, 'has_game_over': True},
                            },
                        ]
                    },
                    {
                        'title': 'Platformer Fun',
                        'slug': 'platformer-fun',
                        'order': 2,
                        'icon_emoji': '🦘',
                        'description': 'Build a jumping game! Add gravity, platforms, and collectibles.',
                        'intro_text': '🦘 Ever played Super Mario? That\'s a PLATFORMER game! The character runs, jumps on platforms, and collects coins. Let\'s build one together! We\'ll add gravity so your character falls down, and a jump button so they can hop up!',
                        'challenges': [
                            {
                                'title': 'Jump!',
                                'slug': 'jump',
                                'difficulty': 'easy',
                                'challenge_type': 'game',
                                'points': 15,
                                'order': 1,
                                'icon_emoji': '⬆️',
                                'description': 'Add gravity and jumping! Make your character jump when you press Space.',
                                'instructions': '🎯 **Goal:** Make the frog jump with the Space bar! 🐸\n\n1. Your frog has GRAVITY — it falls down 📉\n2. Add "When Space Pressed" event\n3. Put "⬆️ Jump" inside it\n4. Press ▶️ Play\n5. Hit Space to make the frog jump! 🐸\n\n🌍 Gravity pulls the frog down. Jumping pushes it up!',
                                'hints': [
                                    '🐸 The frog automatically falls because of gravity',
                                    '⬆️ The Jump block pushes the frog up against gravity',
                                    '⏱️ Time your jumps — the frog comes back down!'
                                ],
                                'toolbox_json': {
                                    'kind': 'flyoutToolbox',
                                    'contents': [
                                        {'kind': 'block', 'type': 'when_space_pressed'},
                                        {'kind': 'block', 'type': 'jump'},
                                        {'kind': 'block', 'type': 'move_left'},
                                        {'kind': 'block', 'type': 'move_right'},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#87CEEB',
                                    'backgroundType': 'color',
                                    'sprite': {'type': 'frog', 'emoji': '🐸', 'x': 100, 'y': 300, 'scale': 2},
                                    'type': 'platformer',
                                    'gravity': True,
                                    'platforms': [
                                        {'x': 0, 'y': 370, 'width': 400, 'height': 30, 'emoji': '🟫'},
                                    ],
                                },
                                'expected_output': {'can_jump': True},
                            },
                            {
                                'title': 'Platform Hopping',
                                'slug': 'platform-hopping',
                                'difficulty': 'medium',
                                'challenge_type': 'game',
                                'points': 25,
                                'order': 2,
                                'icon_emoji': '🏗️',
                                'description': 'Add floating platforms and jump between them to collect coins!',
                                'instructions': '🎯 **Goal:** Jump between platforms and collect 5 coins! 🪙\n\n1. Platforms float at different heights\n2. Use ⬅️➡️ to move and Space to jump\n3. Land on each platform\n4. Walk over coins to collect them 🪙\n5. Don\'t fall off the edge!\n\n🎮 This is how real platformer games work!',
                                'hints': [
                                    '🏗️ You can only land ON TOP of platforms, not from below',
                                    '🪙 Coins disappear when you touch them',
                                    '⚠️ If you fall off the bottom, you restart!'
                                ],
                                'toolbox_json': {
                                    'kind': 'flyoutToolbox',
                                    'contents': [
                                        {'kind': 'block', 'type': 'move_left'},
                                        {'kind': 'block', 'type': 'move_right'},
                                        {'kind': 'block', 'type': 'jump'},
                                        {'kind': 'block', 'type': 'collect'},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#87CEEB',
                                    'backgroundType': 'color',
                                    'sprite': {'type': 'frog', 'emoji': '🐸', 'x': 50, 'y': 340, 'scale': 1.5},
                                    'type': 'platformer',
                                    'gravity': True,
                                    'platforms': [
                                        {'x': 0, 'y': 370, 'width': 120, 'height': 30, 'emoji': '🟫'},
                                        {'x': 150, 'y': 300, 'width': 80, 'height': 20, 'emoji': '🟫'},
                                        {'x': 260, 'y': 240, 'width': 80, 'height': 20, 'emoji': '🟫'},
                                        {'x': 370, 'y': 300, 'width': 80, 'height': 20, 'emoji': '🟫'},
                                    ],
                                    'collectibles': [
                                        {'emoji': '🪙', 'x': 60, 'y': 340},
                                        {'emoji': '🪙', 'x': 180, 'y': 270},
                                        {'emoji': '🪙', 'x': 290, 'y': 210},
                                        {'emoji': '🪙', 'x': 400, 'y': 270},
                                        {'emoji': '🪙', 'x': 190, 'y': 160},
                                    ],
                                },
                                'expected_output': {'collected': 5, 'game_mechanic': 'platformer'},
                            },
                        ]
                    },
                    {
                        'title': 'Maze Runner',
                        'slug': 'maze-runner',
                        'order': 3,
                        'icon_emoji': '🏃',
                        'description': 'Build a maze game! Design the maze and code the player to navigate through it.',
                        'intro_text': '🏃 Let\'s build a maze game! You\'ll create walls, place the exit, and code a player that can navigate through. The twist? You can design your OWN maze layout!',
                        'challenges': [
                            {
                                'title': 'Simple Maze',
                                'slug': 'simple-maze',
                                'difficulty': 'easy',
                                'challenge_type': 'puzzle',
                                'points': 15,
                                'order': 1,
                                'icon_emoji': '🗺️',
                                'description': 'Navigate a simple maze to reach the exit flag!',
                                'instructions': '🎯 **Goal:** Guide the mouse 🐭 through the maze to the cheese 🧀!\n\n1. Use Move and Turn blocks to navigate\n2. Don\'t hit the walls! 🧱\n3. Find the shortest path\n4. Reach the cheese to win!\n\n💡 Plan your path in your head BEFORE coding!',
                                'hints': [
                                    '🗺️ Trace the path with your finger before coding',
                                    '📏 Count the steps between each turn',
                                    '🔁 If you go straight for many steps, use a loop!'
                                ],
                                'toolbox_json': {
                                    'kind': 'flyoutToolbox',
                                    'contents': [
                                        {'kind': 'block', 'type': 'move_forward'},
                                        {'kind': 'block', 'type': 'turn_right'},
                                        {'kind': 'block', 'type': 'turn_left'},
                                        {'kind': 'block', 'type': 'controls_repeat_ext', 'inputs': {'TIMES': {'shadow': {'type': 'math_number', 'fields': {'NUM': 3}}}}},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#F5F5DC',
                                    'backgroundType': 'color',
                                    'sprite': {'type': 'mouse', 'emoji': '🐭', 'x': 30, 'y': 30, 'scale': 1.5},
                                    'goal': {'emoji': '🧀', 'x': 370, 'y': 370},
                                    'type': 'maze',
                                    'walls': [
                                        {'x1': 80, 'y1': 0, 'x2': 80, 'y2': 280},
                                        {'x1': 160, 'y1': 120, 'x2': 160, 'y2': 400},
                                        {'x1': 240, 'y1': 0, 'x2': 240, 'y2': 280},
                                        {'x1': 320, 'y1': 120, 'x2': 320, 'y2': 400},
                                    ],
                                },
                                'expected_output': {'reach_goal': True},
                            },
                        ]
                    },
                ]
            },

            # ──────────────────────────────────────────────
            # COURSE 3: Creative Coding (Ages 8-10)
            # ──────────────────────────────────────────────
            {
                'title': 'Creative Coding',
                'slug': 'creative-coding',
                'age_group': '8-10',
                'description': 'Express yourself through code! Create digital art, animations, and interactive stories. Mix coding with creativity to make something uniquely yours.',
                'icon_emoji': '🎨',
                'color': '#EC4899',
                'status': 'published',
                'order': 3,
                'lessons': [
                    {
                        'title': 'Digital Art',
                        'slug': 'digital-art',
                        'order': 1,
                        'icon_emoji': '🖼️',
                        'description': 'Use code blocks to draw shapes, patterns, and colorful art!',
                        'intro_text': '🎨 Did you know you can make BEAUTIFUL art with code? Instead of using a paintbrush, you\'ll use code blocks to draw shapes, lines, and patterns. The cool part? Code art is perfectly precise — every circle is perfect, every line is straight!',
                        'challenges': [
                            {
                                'title': 'Draw a Rainbow',
                                'slug': 'draw-rainbow',
                                'difficulty': 'medium',
                                'challenge_type': 'art',
                                'points': 20,
                                'order': 1,
                                'icon_emoji': '🌈',
                                'description': 'Draw a beautiful rainbow with 7 colored arcs!',
                                'instructions': '🎯 **Goal:** Draw a rainbow with 7 colors! 🌈\n\nRainbow colors in order:\n🔴 Red → 🟠 Orange → 🟡 Yellow → 🟢 Green → 🔵 Blue → 🟣 Indigo → 💜 Violet\n\n1. Use "🎨 Set Color" to pick a color\n2. Use "⭕ Draw Arc" to draw a curved line\n3. Change the size for each arc (biggest first!)\n4. Repeat for all 7 colors\n\n💡 A rainbow is just 7 arcs stacked!',
                                'hints': [
                                    '🌈 Start with the BIGGEST arc (red) and make each one smaller',
                                    '🎨 Change the color BEFORE each arc',
                                    '🔁 Use a loop and a color list for clean code!'
                                ],
                                'toolbox_json': {
                                    'kind': 'categoryToolbox',
                                    'contents': [
                                        {'kind': 'category', 'name': 'Drawing', 'colour': '20', 'contents': [
                                            {'kind': 'block', 'type': 'draw_arc'},
                                            {'kind': 'block', 'type': 'set_color'},
                                        ]},
                                        {'kind': 'category', 'name': 'Loops', 'colour': '120', 'contents': [
                                            {'kind': 'block', 'type': 'controls_repeat_ext', 'inputs': {'TIMES': {'shadow': {'type': 'math_number', 'fields': {'NUM': 7}}}}},
                                        ]},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#87CEEB',
                                    'backgroundType': 'color',
                                    'type': 'drawing',
                                    'canvas': {'width': 400, 'height': 400},
                                    'drawingTools': ['arc', 'color', 'size'],
                                },
                                'expected_output': {'arcs_drawn': 7, 'colors_used': 7},
                            },
                            {
                                'title': 'Spiral Art',
                                'slug': 'spiral-art',
                                'difficulty': 'hard',
                                'challenge_type': 'art',
                                'points': 30,
                                'order': 2,
                                'icon_emoji': '🌀',
                                'description': 'Create mesmerizing spiral patterns using loops and gradually changing values!',
                                'instructions': '🎯 **Goal:** Create a beautiful spiral! 🌀\n\nA spiral is made by:\n1. Drawing a line\n2. Turning a little\n3. Making the next line SLIGHTLY longer\n4. Repeating many times!\n\nUse a loop with 36 repetitions:\n- Move Forward (increase distance each time)\n- Turn Right 10 degrees\n\n✨ The result is MESMERIZING!',
                                'hints': [
                                    '🌀 Each loop iteration, the line gets a TINY bit longer',
                                    '📐 Turn by the same amount each time (10 degrees works great)',
                                    '🔁 Use at least 36 repetitions for a full spiral'
                                ],
                                'toolbox_json': {
                                    'kind': 'categoryToolbox',
                                    'contents': [
                                        {'kind': 'category', 'name': 'Drawing', 'colour': '20', 'contents': [
                                            {'kind': 'block', 'type': 'draw_line'},
                                            {'kind': 'block', 'type': 'set_color'},
                                        ]},
                                        {'kind': 'category', 'name': 'Movement', 'colour': '230', 'contents': [
                                            {'kind': 'block', 'type': 'turn_right'},
                                        ]},
                                        {'kind': 'category', 'name': 'Loops', 'colour': '120', 'contents': [
                                            {'kind': 'block', 'type': 'controls_repeat_ext', 'inputs': {'TIMES': {'shadow': {'type': 'math_number', 'fields': {'NUM': 36}}}}},
                                        ]},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#1a1a2e',
                                    'backgroundType': 'color',
                                    'type': 'drawing',
                                    'canvas': {'width': 400, 'height': 400},
                                    'drawingTools': ['line', 'color', 'size', 'turn'],
                                    'penColor': '#F97316',
                                },
                                'expected_output': {'spiral': True, 'min_iterations': 36},
                            },
                        ]
                    },
                    {
                        'title': 'Animations',
                        'slug': 'animations',
                        'order': 2,
                        'icon_emoji': '🎬',
                        'description': 'Bring your art to life! Make characters move, dance, and tell stories.',
                        'intro_text': '🎬 Static art is cool, but MOVING art is even cooler! An animation is just many pictures shown really fast — like a flipbook. Let\'s make our code drawings come to life!',
                        'challenges': [
                            {
                                'title': 'Bouncing Ball',
                                'slug': 'bouncing-ball',
                                'difficulty': 'easy',
                                'challenge_type': 'animation',
                                'points': 15,
                                'order': 1,
                                'icon_emoji': '⚽',
                                'description': 'Create a ball that bounces up and down forever!',
                                'instructions': '🎯 **Goal:** Make a ball bounce up and down! ⚽\n\n1. Place a ball on the screen 🔴\n2. Use a Forever Loop\n3. Inside: Move Down, then check "If at bottom → Move Up"\n4. The ball bounces forever!\n\n🏀 Real physics: the ball speeds up going down and slows going up!',
                                'hints': [
                                    '⚽ The ball starts at the top and falls down',
                                    '🔄 When it hits the bottom, reverse direction!',
                                    '🔁 The Forever Loop makes it keep going'
                                ],
                                'toolbox_json': {
                                    'kind': 'flyoutToolbox',
                                    'contents': [
                                        {'kind': 'block', 'type': 'forever_loop'},
                                        {'kind': 'block', 'type': 'move_down'},
                                        {'kind': 'block', 'type': 'move_up'},
                                        {'kind': 'block', 'type': 'if_touching'},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#F0F9FF',
                                    'backgroundType': 'color',
                                    'sprite': {'type': 'ball', 'emoji': '🔴', 'x': 200, 'y': 50, 'scale': 2},
                                    'type': 'animation',
                                    'physics': {'gravity': 0.5, 'bounce': 0.8},
                                },
                                'expected_output': {'animation': 'bounce', 'continuous': True},
                            },
                            {
                                'title': 'Dancing Characters',
                                'slug': 'dancing-characters',
                                'difficulty': 'medium',
                                'challenge_type': 'animation',
                                'points': 25,
                                'order': 2,
                                'icon_emoji': '🕺',
                                'description': 'Create a dance party with multiple animated characters!',
                                'instructions': '🎯 **Goal:** Make 3 characters dance together! 🕺💃🤖\n\n1. Place 3 characters on the stage\n2. Give each one a different dance move:\n   - Character 1: Spin in circles 🔄\n   - Character 2: Jump up and down ⬆️\n   - Character 3: Slide left and right ↔️\n3. Add music beats! 🎵\n4. They all dance at the same time!\n\n🎶 Code can be a dance party!',
                                'hints': [
                                    '👯 Each character needs its OWN set of movement blocks',
                                    '🔁 Put each dance inside a Forever Loop',
                                    '🎵 The Beat block adds rhythm to the movements'
                                ],
                                'toolbox_json': {
                                    'kind': 'categoryToolbox',
                                    'contents': [
                                        {'kind': 'category', 'name': 'Animation', 'colour': '290', 'contents': [
                                            {'kind': 'block', 'type': 'dance'},
                                            {'kind': 'block', 'type': 'jump'},
                                        ]},
                                        {'kind': 'category', 'name': 'Movement', 'colour': '230', 'contents': [
                                            {'kind': 'block', 'type': 'move_left'},
                                            {'kind': 'block', 'type': 'move_right'},
                                            {'kind': 'block', 'type': 'turn_right'},
                                        ]},
                                        {'kind': 'category', 'name': 'Loops', 'colour': '120', 'contents': [
                                            {'kind': 'block', 'type': 'forever_loop'},
                                        ]},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#1a1a2e',
                                    'backgroundType': 'color',
                                    'sprites': [
                                        {'type': 'dancer1', 'emoji': '🕺', 'x': 100, 'y': 200, 'scale': 2},
                                        {'type': 'dancer2', 'emoji': '💃', 'x': 200, 'y': 200, 'scale': 2},
                                        {'type': 'dancer3', 'emoji': '🤖', 'x': 300, 'y': 200, 'scale': 2},
                                    ],
                                    'type': 'animation',
                                    'effects': ['disco_lights', 'sparkles', 'music_notes'],
                                },
                                'expected_output': {'characters_animated': 3, 'continuous': True},
                            },
                        ]
                    },
                ]
            },

            # ──────────────────────────────────────────────
            # COURSE 4: Python for Kids (Ages 11-13)
            # ──────────────────────────────────────────────
            {
                'title': 'Python for Kids',
                'slug': 'python-for-kids',
                'age_group': '11-13',
                'description': 'Ready for REAL coding? Learn Python — the same language used by NASA, Google, and game studios! Start with the basics and build your own text adventures, quizzes, and mini-apps.',
                'icon_emoji': '🐍',
                'color': '#3B82F6',
                'status': 'published',
                'order': 4,
                'lessons': [
                    {
                        'title': 'Hello, Python!',
                        'slug': 'hello-python',
                        'order': 1,
                        'icon_emoji': '👋',
                        'description': 'Write your first Python code! Learn to print, use variables, and get user input.',
                        'intro_text': '🐍 Welcome to Python — the language of the pros! Don\'t worry, it\'s way easier than it sounds. Instead of dragging blocks, you\'ll TYPE code. Let\'s start with the most famous first line of code ever written...',
                        'challenges': [
                            {
                                'title': 'Hello World!',
                                'slug': 'hello-world',
                                'difficulty': 'easy',
                                'challenge_type': 'blocks',
                                'points': 10,
                                'order': 1,
                                'icon_emoji': '🌍',
                                'description': 'Write the most famous first program — Hello, World!',
                                'instructions': '🎯 **Goal:** Make the computer say "Hello, World!" 🌍\n\nIn Python, you use `print()` to display text:\n```python\nprint("Hello, World!")\n```\n\n1. Find the "print" block\n2. Type your message inside the quotes\n3. Press ▶️ Run\n4. See your message appear! ✨\n\n🎉 Congratulations! Every programmer started right here!',
                                'hints': [
                                    '📝 print() shows text on the screen',
                                    '💬 Text goes inside quotes: "Hello, World!"',
                                    '🎯 Make sure you type it exactly: print("Hello, World!")'
                                ],
                                'toolbox_json': {
                                    'kind': 'categoryToolbox',
                                    'contents': [
                                        {'kind': 'category', 'name': 'Text', 'colour': '160', 'contents': [
                                            {'kind': 'block', 'type': 'text_print'},
                                            {'kind': 'block', 'type': 'text'},
                                            {'kind': 'block', 'type': 'text_join'},
                                            {'kind': 'block', 'type': 'text_length'},
                                        ]},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#1e1e1e',
                                    'backgroundType': 'color',
                                    'type': 'console',
                                    'showConsole': True,
                                },
                                'expected_output': {'console_output': 'Hello, World!'},
                            },
                            {
                                'title': 'Variables — Name Tag',
                                'slug': 'variables-name',
                                'difficulty': 'easy',
                                'challenge_type': 'blocks',
                                'points': 15,
                                'order': 2,
                                'icon_emoji': '📛',
                                'description': 'Learn about variables by storing your name and printing a greeting!',
                                'instructions': '🎯 **Goal:** Store your name in a variable and greet yourself!\n\nA variable is like a box with a label 📦:\n```python\nname = "Alex"\nprint("Hello, " + name + "!")\n```\n\n1. Create a variable called `name`\n2. Set it to YOUR name\n3. Print a greeting using your variable\n4. Try changing the name — the greeting changes too! 🔄',
                                'hints': [
                                    '📦 A variable stores data — like a labeled box',
                                    '= means "put this value in the box"',
                                    '➕ Use + to join text together: "Hello, " + name'
                                ],
                                'toolbox_json': {
                                    'kind': 'categoryToolbox',
                                    'contents': [
                                        {'kind': 'category', 'name': 'Variables', 'colour': '330', 'custom': 'VARIABLE'},
                                        {'kind': 'category', 'name': 'Text', 'colour': '160', 'contents': [
                                            {'kind': 'block', 'type': 'text_print'},
                                            {'kind': 'block', 'type': 'text'},
                                            {'kind': 'block', 'type': 'text_join'},
                                        ]},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#1e1e1e',
                                    'backgroundType': 'color',
                                    'type': 'console',
                                    'showConsole': True,
                                },
                                'expected_output': {'uses_variable': True, 'prints_greeting': True},
                            },
                            {
                                'title': 'User Input — Ask Questions',
                                'slug': 'user-input',
                                'difficulty': 'medium',
                                'challenge_type': 'blocks',
                                'points': 20,
                                'order': 3,
                                'icon_emoji': '❓',
                                'description': 'Make your program interactive! Ask the user questions and respond.',
                                'instructions': '🎯 **Goal:** Build an interactive greeting program! 💬\n\n```python\nname = input("What is your name? ")\nage = input("How old are you? ")\nprint("Hi " + name + "! You are " + age + " years old!")\n```\n\n1. Use `input()` to ask a question\n2. Store the answer in a variable\n3. Ask at least 2 questions\n4. Print a message using both answers!\n\n💡 `input()` waits for the user to type and press Enter',
                                'hints': [
                                    '💬 input("question") asks the user something',
                                    '📦 Store the answer: name = input("Your name? ")',
                                    '🔗 Combine answers in your final print message'
                                ],
                                'toolbox_json': {
                                    'kind': 'categoryToolbox',
                                    'contents': [
                                        {'kind': 'category', 'name': 'Text', 'colour': '160', 'contents': [
                                            {'kind': 'block', 'type': 'text_print'},
                                            {'kind': 'block', 'type': 'text'},
                                            {'kind': 'block', 'type': 'text_join'},
                                            {'kind': 'block', 'type': 'text_prompt_ext'},
                                        ]},
                                        {'kind': 'category', 'name': 'Variables', 'colour': '330', 'custom': 'VARIABLE'},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#1e1e1e',
                                    'backgroundType': 'color',
                                    'type': 'console',
                                    'showConsole': True,
                                    'interactive': True,
                                },
                                'expected_output': {'uses_input': True, 'input_count': 2},
                            },
                        ]
                    },
                    {
                        'title': 'Decisions & Logic',
                        'slug': 'decisions-logic',
                        'order': 2,
                        'icon_emoji': '🤔',
                        'description': 'Teach your code to make decisions! If this, do that — else, do something different.',
                        'intro_text': '🤔 Right now, your code does the SAME thing every time. But what if you want different things to happen based on user choices? That\'s where IF statements come in! "IF it\'s raining, take an umbrella. ELSE, wear sunglasses." Let\'s code decisions!',
                        'challenges': [
                            {
                                'title': 'Age Checker',
                                'slug': 'age-checker',
                                'difficulty': 'easy',
                                'challenge_type': 'blocks',
                                'points': 15,
                                'order': 1,
                                'icon_emoji': '🎂',
                                'description': 'Build a program that checks if someone is old enough for a roller coaster!',
                                'instructions': '🎯 **Goal:** Check if someone can ride the roller coaster! 🎢\n\nRules:\n- Height ≥ 120cm → "You can ride! 🎢"\n- Height < 120cm → "Sorry, too short! Come back later 📏"\n\n```python\nheight = int(input("Your height in cm? "))\nif height >= 120:\n    print("You can ride! 🎢")\nelse:\n    print("Sorry, too short!")\n```\n\n💡 `int()` converts text to a number so we can compare!',
                                'hints': [
                                    '🔢 Use int() to convert the input to a number',
                                    '📏 >= means "greater than or equal to"',
                                    '🔀 The code under `if` runs when TRUE, `else` runs when FALSE'
                                ],
                                'toolbox_json': {
                                    'kind': 'categoryToolbox',
                                    'contents': [
                                        {'kind': 'category', 'name': 'Logic', 'colour': '210', 'contents': [
                                            {'kind': 'block', 'type': 'controls_if'},
                                            {'kind': 'block', 'type': 'controls_ifelse'},
                                            {'kind': 'block', 'type': 'logic_compare'},
                                            {'kind': 'block', 'type': 'logic_operation'},
                                            {'kind': 'block', 'type': 'logic_boolean'},
                                        ]},
                                        {'kind': 'category', 'name': 'Math', 'colour': '230', 'contents': [
                                            {'kind': 'block', 'type': 'math_number'},
                                            {'kind': 'block', 'type': 'math_arithmetic'},
                                        ]},
                                        {'kind': 'category', 'name': 'Text', 'colour': '160', 'contents': [
                                            {'kind': 'block', 'type': 'text_print'},
                                            {'kind': 'block', 'type': 'text'},
                                            {'kind': 'block', 'type': 'text_prompt_ext'},
                                        ]},
                                        {'kind': 'category', 'name': 'Variables', 'colour': '330', 'custom': 'VARIABLE'},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#1e1e1e',
                                    'backgroundType': 'color',
                                    'type': 'console',
                                    'showConsole': True,
                                    'interactive': True,
                                },
                                'expected_output': {'uses_if': True, 'uses_comparison': True},
                            },
                            {
                                'title': 'Number Guessing Game',
                                'slug': 'number-guess',
                                'difficulty': 'hard',
                                'challenge_type': 'blocks',
                                'points': 35,
                                'order': 2,
                                'icon_emoji': '🔢',
                                'description': 'Build a number guessing game with hints! The computer picks a random number and you guess.',
                                'instructions': '🎯 **Goal:** Build a guessing game! 🎲\n\nThe computer picks a random number 1-10.\nYou get 3 tries to guess it!\n\nAfter each guess:\n- Too high → "📉 Lower!"\n- Too low → "📈 Higher!"\n- Correct → "🎉 You got it!"\n\nCombine: loops + if/else + input + random!\n\n🏆 This is a REAL game people play!',
                                'hints': [
                                    '🎲 Use "random number 1 to 10" block to pick the secret number',
                                    '🔁 Use a loop for 3 guesses',
                                    '🔀 Inside the loop: get input, compare, give hint'
                                ],
                                'toolbox_json': {
                                    'kind': 'categoryToolbox',
                                    'contents': [
                                        {'kind': 'category', 'name': 'Logic', 'colour': '210', 'contents': [
                                            {'kind': 'block', 'type': 'controls_if'},
                                            {'kind': 'block', 'type': 'controls_ifelse'},
                                            {'kind': 'block', 'type': 'logic_compare'},
                                            {'kind': 'block', 'type': 'logic_operation'},
                                            {'kind': 'block', 'type': 'logic_boolean'},
                                        ]},
                                        {'kind': 'category', 'name': 'Loops', 'colour': '120', 'contents': [
                                            {'kind': 'block', 'type': 'controls_repeat_ext', 'inputs': {'TIMES': {'shadow': {'type': 'math_number', 'fields': {'NUM': 5}}}}},
                                            {'kind': 'block', 'type': 'controls_whileUntil'},
                                        ]},
                                        {'kind': 'category', 'name': 'Math', 'colour': '230', 'contents': [
                                            {'kind': 'block', 'type': 'math_number'},
                                            {'kind': 'block', 'type': 'math_arithmetic'},
                                            {'kind': 'block', 'type': 'math_random_int'},
                                        ]},
                                        {'kind': 'category', 'name': 'Text', 'colour': '160', 'contents': [
                                            {'kind': 'block', 'type': 'text_print'},
                                            {'kind': 'block', 'type': 'text'},
                                            {'kind': 'block', 'type': 'text_prompt_ext'},
                                            {'kind': 'block', 'type': 'text_join'},
                                        ]},
                                        {'kind': 'category', 'name': 'Variables', 'colour': '330', 'custom': 'VARIABLE'},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#1e1e1e',
                                    'backgroundType': 'color',
                                    'type': 'console',
                                    'showConsole': True,
                                    'interactive': True,
                                },
                                'expected_output': {'uses_random': True, 'uses_loop': True, 'uses_if': True, 'game_complete': True},
                            },
                        ]
                    },
                    {
                        'title': 'Text Adventure',
                        'slug': 'text-adventure',
                        'order': 3,
                        'icon_emoji': '📖',
                        'description': 'Build a choose-your-own-adventure story game using everything you\'ve learned!',
                        'intro_text': '📖 You know variables, input, and if/else. Now let\'s combine EVERYTHING to build a text adventure game! It\'s a story where the reader makes choices that change what happens. Like a book where YOU are the hero!',
                        'challenges': [
                            {
                                'title': 'The Dragon\'s Cave',
                                'slug': 'dragons-cave',
                                'difficulty': 'medium',
                                'challenge_type': 'blocks',
                                'points': 30,
                                'order': 1,
                                'icon_emoji': '🐉',
                                'description': 'Build a text adventure where the player explores a dragon\'s cave and makes life-or-death choices!',
                                'instructions': '🎯 **Goal:** Create "The Dragon\'s Cave" adventure! 🐉\n\nThe story:\n1. 📖 "You enter a dark cave..."\n2. ❓ "Do you go LEFT or RIGHT?"\n3. LEFT → "You find a treasure chest! 💰"\n4. RIGHT → "You meet a dragon! 🐉"\n5. If dragon: "Do you FIGHT or RUN?"\n6. FIGHT → "The dragon is friendly! You made a friend! 🤝"\n7. RUN → "You escape safely! 🏃"\n\nUse nested if/else blocks for branching paths!',
                                'hints': [
                                    '📖 Use print() for the story text',
                                    '❓ Use input() for each choice',
                                    '🔀 Nested if = an if INSIDE another if (for the dragon scene)'
                                ],
                                'toolbox_json': {
                                    'kind': 'categoryToolbox',
                                    'contents': [
                                        {'kind': 'category', 'name': 'Logic', 'colour': '210', 'contents': [
                                            {'kind': 'block', 'type': 'controls_if'},
                                            {'kind': 'block', 'type': 'controls_ifelse'},
                                            {'kind': 'block', 'type': 'logic_compare'},
                                            {'kind': 'block', 'type': 'logic_operation'},
                                            {'kind': 'block', 'type': 'logic_boolean'},
                                        ]},
                                        {'kind': 'category', 'name': 'Loops', 'colour': '120', 'contents': [
                                            {'kind': 'block', 'type': 'controls_repeat_ext', 'inputs': {'TIMES': {'shadow': {'type': 'math_number', 'fields': {'NUM': 3}}}}},
                                            {'kind': 'block', 'type': 'controls_whileUntil'},
                                        ]},
                                        {'kind': 'category', 'name': 'Text', 'colour': '160', 'contents': [
                                            {'kind': 'block', 'type': 'text_print'},
                                            {'kind': 'block', 'type': 'text'},
                                            {'kind': 'block', 'type': 'text_prompt_ext'},
                                            {'kind': 'block', 'type': 'text_join'},
                                        ]},
                                        {'kind': 'category', 'name': 'Variables', 'colour': '330', 'custom': 'VARIABLE'},
                                        {'kind': 'category', 'name': 'Functions', 'colour': '290', 'custom': 'PROCEDURE'},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#1a1a2e',
                                    'backgroundType': 'color',
                                    'type': 'console',
                                    'showConsole': True,
                                    'interactive': True,
                                    'storyMode': True,
                                },
                                'expected_output': {'branches': 3, 'uses_nested_if': True, 'interactive': True},
                            },
                        ]
                    },
                ]
            },

            # ──────────────────────────────────────────────
            # COURSE 5: Web Design for Kids (Ages 11-13)
            # ──────────────────────────────────────────────
            {
                'title': 'Web Design for Kids',
                'slug': 'web-design-kids',
                'age_group': '11-13',
                'description': 'Build your own websites! Learn HTML and CSS to create pages about anything you love — your pets, hobbies, or favorite games. Share your site with friends and family!',
                'icon_emoji': '🌐',
                'color': '#10B981',
                'status': 'published',
                'order': 5,
                'lessons': [
                    {
                        'title': 'My First Webpage',
                        'slug': 'first-webpage',
                        'order': 1,
                        'icon_emoji': '📄',
                        'description': 'Create a webpage with headings, paragraphs, and images!',
                        'intro_text': '🌐 Every website you visit — YouTube, Minecraft wiki, your school site — is made with HTML! HTML is like the skeleton of a webpage. Let\'s build YOUR first page!',
                        'challenges': [
                            {
                                'title': 'About Me Page',
                                'slug': 'about-me',
                                'difficulty': 'easy',
                                'challenge_type': 'blocks',
                                'points': 15,
                                'order': 1,
                                'icon_emoji': '👤',
                                'description': 'Build an "About Me" webpage with your name, a picture, and fun facts!',
                                'instructions': '🎯 **Goal:** Create your "About Me" webpage! 👤\n\nEvery webpage needs:\n- `<h1>` — Big heading (your name!)\n- `<p>` — Paragraph (write about yourself)\n- `<img>` — Image (pick an avatar!)\n- `<ul>` — List (your hobbies!)\n\n1. Add a heading with your name\n2. Write a short paragraph about yourself\n3. Add an emoji avatar 🧑‍💻\n4. List 3 of your hobbies\n\n🌐 This is a REAL webpage!',
                                'hints': [
                                    '📝 <h1>Your Name</h1> creates a big heading',
                                    '📄 <p>Text here</p> creates a paragraph',
                                    '📋 <ul><li>Hobby 1</li><li>Hobby 2</li></ul> creates a list'
                                ],
                                'toolbox_json': {
                                    'kind': 'categoryToolbox',
                                    'contents': [
                                        {'kind': 'category', 'name': 'HTML', 'colour': '20', 'contents': [
                                            {'kind': 'block', 'type': 'html_heading'},
                                            {'kind': 'block', 'type': 'html_paragraph'},
                                            {'kind': 'block', 'type': 'html_image'},
                                            {'kind': 'block', 'type': 'html_list'},
                                        ]},
                                        {'kind': 'category', 'name': 'Text', 'colour': '160', 'contents': [
                                            {'kind': 'block', 'type': 'text'},
                                            {'kind': 'block', 'type': 'text_join'},
                                        ]},
                                    ]
                                },
                                'stage_config': {
                                    'background': '#FFFFFF',
                                    'backgroundType': 'color',
                                    'type': 'web_preview',
                                    'showPreview': True,
                                    'showCode': True,
                                },
                                'expected_output': {'has_heading': True, 'has_paragraph': True, 'has_list': True},
                            },
                        ]
                    },
                ]
            },
        ]

        total_lessons = 0
        total_challenges = 0

        for course_data in courses_data:
            lessons_data = course_data.pop('lessons')
            course, _ = KidCourse.objects.update_or_create(
                slug=course_data['slug'], defaults=course_data
            )
            for lesson_data in lessons_data:
                challenges_data = lesson_data.pop('challenges')
                lesson, _ = KidLesson.objects.update_or_create(
                    course=course, slug=lesson_data['slug'], defaults=lesson_data
                )
                total_lessons += 1
                for challenge_data in challenges_data:
                    KidChallenge.objects.update_or_create(
                        lesson=lesson, slug=challenge_data['slug'], defaults=challenge_data
                    )
                    total_challenges += 1

        self.stdout.write(self.style.SUCCESS(
            f'✅ Seeded kids content: {len(courses_data)} courses, {total_lessons} lessons, {total_challenges} challenges'
        ))
