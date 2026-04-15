"""Seed the three capstone challenges into the Python track.

Adds a "capstone" Concept under the existing `python` Track, plus three
hard-difficulty exercises that force students to combine multiple Python
features (custom exceptions, generators, decorators, etc.) rather than
drill a single concept.

Idempotent — safe to re-run. Uses get_or_create on (track, slug) and
(concept, slug), so existing rows are left untouched.

Usage:
    python manage.py seed_track_capstones

Requires:
    A Track with slug='python' must already exist (prod does; fresh
    dev DBs should run whatever bootstraps Track rows first, e.g.
    via Django admin or a prior seed).
"""

from django.core.management.base import BaseCommand
from apps.tracks.models import Track, Concept, Exercise


CONCEPT = {
    'slug': 'capstone',
    'title': {'en': 'Capstone Challenges', 'ar': 'تحديات ختامية', 'es': 'Desafíos Finales'},
    'description': {
        'en': 'Integrative challenges that combine OOP, data structures, I/O, generators, decorators, and error handling.',
        'ar': 'تحديات تدمج البرمجة الكائنية وهياكل البيانات والمولدات والمزخرفات ومعالجة الأخطاء.',
        'es': 'Desafíos que combinan POO, estructuras de datos, generadores, decoradores y manejo de errores.',
    },
    'order': 100,  # put it at the end of the concept list
}


EXERCISES = [
    {
        'slug': 'inventory-manager',
        'title': {'en': 'Inventory Manager', 'ar': 'مدير المخزون', 'es': 'Gestor de Inventario'},
        'description': {
            'en': 'Build a stateful InventoryManager class with a custom exception, CSV-like parsing, mutation, filtered queries, and serialization.',
            'ar': 'ابنِ فئة InventoryManager ذات حالة مع استثناء مخصص وتحليل وتعديل وتسلسل.',
            'es': 'Construye una clase InventoryManager con estado, excepción personalizada, análisis, mutación y serialización.',
        },
        'difficulty': 'hard',
        'instructions': {
            'en': (
                'Implement `class InsufficientStockError(Exception)` and `class InventoryManager` with:\n'
                '- `__init__(data="")` parses lines like `"apples, 10"`; raises ValueError on bad lines.\n'
                '- `add(name, qty)` / `remove(name, qty)` / `adjust(name, qty)` — `remove` raises `InsufficientStockError` if qty > current.\n'
                '- `low_stock(threshold)` returns a sorted list of names with qty < threshold.\n'
                '- `serialize()` returns a newline-joined "name,qty" string sorted by name.\n'
                'Store stock in `self._stock` (dict).'
            ),
        },
        'starter_code': {
            'python': (
                'class InsufficientStockError(Exception):\n'
                '    pass\n\n'
                'class InventoryManager:\n'
                '    def __init__(self, data=""):\n'
                '        self._stock = {}\n'
                '        # Your code here\n\n'
                '    def add(self, name, qty):\n'
                '        pass\n\n'
                '    def remove(self, name, qty):\n'
                '        pass\n\n'
                '    def adjust(self, name, qty):\n'
                '        pass\n\n'
                '    def low_stock(self, threshold):\n'
                '        pass\n\n'
                '    def serialize(self):\n'
                '        pass\n'
            ),
        },
        'test_code': {
            'python': (
                'inv = InventoryManager("apples, 10\\nbananas, 3\\ncherries, 8")\n'
                'assert inv.serialize() == "apples,10\\nbananas,3\\ncherries,8"\n'
                'inv.add("apples", 5); assert inv._stock["apples"] == 15\n'
                'inv.remove("bananas", 2); assert inv._stock["bananas"] == 1\n'
                'try:\n'
                '    inv.remove("bananas", 10); assert False\n'
                'except InsufficientStockError:\n'
                '    pass\n'
                'inv.adjust("cherries", 100); assert inv._stock["cherries"] == 100\n'
                'inv.add("dates", 2); assert inv.low_stock(5) == ["bananas", "dates"]\n'
                'assert InventoryManager("").serialize() == ""\n'
                'try:\n'
                '    InventoryManager("bad line"); assert False\n'
                'except ValueError:\n'
                '    pass\n'
                'print("All tests passed!")\n'
            ),
        },
        'solution': {
            'python': (
                'class InsufficientStockError(Exception):\n'
                '    pass\n\n'
                'class InventoryManager:\n'
                '    def __init__(self, data=""):\n'
                '        self._stock = {}\n'
                '        if data.strip():\n'
                '            for line in data.strip().splitlines():\n'
                '                parts = [p.strip() for p in line.split(",")]\n'
                '                if len(parts) != 2:\n'
                '                    raise ValueError(f"Bad line: {line!r}")\n'
                '                name, qty = parts\n'
                '                self._stock[name] = int(qty)\n\n'
                '    def add(self, name, qty):\n'
                '        if qty < 0:\n'
                '            raise ValueError("qty must be non-negative")\n'
                '        self._stock[name] = self._stock.get(name, 0) + qty\n\n'
                '    def remove(self, name, qty):\n'
                '        current = self._stock.get(name, 0)\n'
                '        if qty > current:\n'
                '            raise InsufficientStockError(f"Cannot remove {qty} of {name!r}: only {current} in stock")\n'
                '        self._stock[name] = current - qty\n\n'
                '    def adjust(self, name, qty):\n'
                '        if qty < 0:\n'
                '            raise ValueError("qty must be non-negative")\n'
                '        self._stock[name] = qty\n\n'
                '    def low_stock(self, threshold):\n'
                '        return sorted(n for n, q in self._stock.items() if q < threshold)\n\n'
                '    def serialize(self):\n'
                '        return "\\n".join(f"{n},{q}" for n, q in sorted(self._stock.items()))\n'
            ),
        },
        'order': 1,
    },
    {
        'slug': 'event-log-aggregator',
        'title': {'en': 'Event Log Aggregator', 'ar': 'مُجمِّع سجلات الأحداث', 'es': 'Agregador de Eventos'},
        'description': {
            'en': 'Parse a multi-line log with a generator and compute severity counts, top errors, and per-minute buckets.',
            'ar': 'حلّل سجلاً متعدد الأسطر باستخدام مولّد واحسب الإحصائيات.',
            'es': 'Analiza un registro de varias líneas con un generador y calcula estadísticas.',
        },
        'difficulty': 'hard',
        'instructions': {
            'en': (
                'Each line looks like `"2026-04-15T08:00:00 INFO  user 42 logged in"`. Implement:\n'
                '- `parse_events(text)` — **generator** yielding `{"ts", "severity", "message"}` dicts. Skip malformed/empty lines.\n'
                '- `severity_counts(events)` — `{severity: count}` (must accept any iterable).\n'
                '- `top_errors(events, n=3)` — list of `(message, count)` where severity == "ERROR", sorted desc.\n'
                '- `per_minute(events)` — `{minute_iso: count}` where `minute_iso = ts[:16]`.'
            ),
        },
        'starter_code': {
            'python': (
                'from collections import Counter\n\n'
                'def parse_events(text):\n'
                '    # yield dicts; must be a generator\n'
                '    pass\n\n'
                'def severity_counts(events):\n'
                '    pass\n\n'
                'def top_errors(events, n=3):\n'
                '    pass\n\n'
                'def per_minute(events):\n'
                '    pass\n'
            ),
        },
        'test_code': {
            'python': (
                'LOG = """2026-04-15T08:00:01 INFO  user 42 logged in\n'
                '2026-04-15T08:00:05 ERROR db connection refused\n'
                '2026-04-15T08:00:10 WARN  slow query: users\n'
                '2026-04-15T08:01:00 ERROR db connection refused\n'
                '2026-04-15T08:01:30 INFO  user 7 logged in\n'
                '2026-04-15T08:01:45 ERROR cache miss storm\n'
                'malformed line with no timestamp\n'
                '2026-04-15T08:02:00 ERROR db connection refused"""\n\n'
                'events = list(parse_events(LOG))\n'
                'assert len(events) == 7\n'
                'assert events[0]["severity"] == "INFO"\n'
                'assert severity_counts(iter(events)) == {"INFO": 2, "ERROR": 4, "WARN": 1}\n'
                'te = top_errors(events, n=2)\n'
                'assert te[0] == ("db connection refused", 3) and len(te) == 2\n'
                'assert per_minute(events) == {"2026-04-15T08:00": 3, "2026-04-15T08:01": 3, "2026-04-15T08:02": 1}\n'
                'assert hasattr(parse_events(LOG), "__next__")\n'
                'print("All tests passed!")\n'
            ),
        },
        'solution': {
            'python': (
                'from collections import Counter\n\n'
                'def parse_events(text):\n'
                '    for line in text.splitlines():\n'
                '        line = line.strip()\n'
                '        if not line:\n'
                '            continue\n'
                '        parts = line.split(maxsplit=2)\n'
                '        if len(parts) < 3:\n'
                '            continue\n'
                '        ts, severity, message = parts\n'
                '        if "T" not in ts or not ts[:1].isdigit():\n'
                '            continue\n'
                '        yield {"ts": ts, "severity": severity, "message": message}\n\n'
                'def severity_counts(events):\n'
                '    return dict(Counter(e["severity"] for e in events))\n\n'
                'def top_errors(events, n=3):\n'
                '    c = Counter(e["message"] for e in events if e["severity"] == "ERROR")\n'
                '    return c.most_common(n)\n\n'
                'def per_minute(events):\n'
                '    out = {}\n'
                '    for e in events:\n'
                '        minute = e["ts"][:16]\n'
                '        out[minute] = out.get(minute, 0) + 1\n'
                '    return out\n'
            ),
        },
        'order': 2,
    },
    {
        'slug': 'tiny-state-machine',
        'title': {'en': 'Tiny State Machine', 'ar': 'آلة حالة صغيرة', 'es': 'Máquina de Estados Pequeña'},
        'description': {
            'en': 'Design a @transition decorator and Machine base class that enforce valid state transitions and record history.',
            'ar': 'صمم مزخرف @transition وفئة Machine تفرضان الانتقالات الصالحة.',
            'es': 'Diseña un decorador @transition y una clase Machine que apliquen transiciones válidas.',
        },
        'difficulty': 'hard',
        'instructions': {
            'en': (
                'Implement:\n'
                '- `class TransitionError(Exception)`.\n'
                '- `@transition(from_state, to_state)` — at call time, raise `TransitionError` if `self.state != from_state`; '
                'otherwise run the method, append `(from_state, to_state)` to `self.history`, set `self.state = to_state`, return result.\n'
                '- `class Machine` with `__init__(initial_state)` storing `self.state` and `self.history = []` (initial state not recorded).'
            ),
        },
        'starter_code': {
            'python': (
                'class TransitionError(Exception):\n'
                '    pass\n\n'
                'def transition(from_state, to_state):\n'
                '    def decorator(method):\n'
                '        def wrapper(self, *args, **kwargs):\n'
                '            # Your code here\n'
                '            pass\n'
                '        return wrapper\n'
                '    return decorator\n\n'
                'class Machine:\n'
                '    def __init__(self, initial_state):\n'
                '        self.state = initial_state\n'
                '        self.history = []\n'
            ),
        },
        'test_code': {
            'python': (
                'class Door(Machine):\n'
                '    def __init__(self):\n'
                '        super().__init__("closed")\n'
                '    @transition("closed", "open")\n'
                '    def open(self):\n'
                '        return "opened"\n'
                '    @transition("open", "closed")\n'
                '    def close(self):\n'
                '        return "closed"\n'
                '    @transition("closed", "locked")\n'
                '    def lock(self):\n'
                '        return "locked"\n'
                '    @transition("locked", "closed")\n'
                '    def unlock(self):\n'
                '        return "unlocked"\n\n'
                'd = Door()\n'
                'assert d.state == "closed" and d.history == []\n'
                'assert d.open() == "opened" and d.state == "open"\n'
                'assert d.history == [("closed", "open")]\n'
                'd.close(); d.lock()\n'
                'assert d.state == "locked"\n'
                'try:\n'
                '    d.open(); assert False\n'
                'except TransitionError:\n'
                '    pass\n'
                'd.unlock()\n'
                'assert d.state == "closed" and len(d.history) == 4\n'
                'print("All tests passed!")\n'
            ),
        },
        'solution': {
            'python': (
                'class TransitionError(Exception):\n'
                '    pass\n\n'
                'def transition(from_state, to_state):\n'
                '    def decorator(method):\n'
                '        def wrapper(self, *args, **kwargs):\n'
                '            if self.state != from_state:\n'
                '                raise TransitionError(f"{method.__name__}: expected state {from_state!r}, got {self.state!r}")\n'
                '            result = method(self, *args, **kwargs)\n'
                '            self.history.append((from_state, to_state))\n'
                '            self.state = to_state\n'
                '            return result\n'
                '        return wrapper\n'
                '    return decorator\n\n'
                'class Machine:\n'
                '    def __init__(self, initial_state):\n'
                '        self.state = initial_state\n'
                '        self.history = []\n'
            ),
        },
        'order': 3,
    },
]


class Command(BaseCommand):
    help = 'Seed the three integrative capstone challenges into the Python track.'

    def add_arguments(self, parser):
        parser.add_argument('--track', default='python', help='Track slug (default: python)')

    def handle(self, *args, **options):
        track_slug = options['track']
        try:
            track = Track.objects.get(slug=track_slug)
        except Track.DoesNotExist:
            self.stderr.write(self.style.ERROR(
                f'Track with slug {track_slug!r} not found. Create it first (admin or earlier seed).'
            ))
            return

        concept, created = Concept.objects.get_or_create(
            track=track, slug=CONCEPT['slug'],
            defaults={k: v for k, v in CONCEPT.items() if k != 'slug'},
        )
        self.stdout.write(f"  Concept: {concept.slug} ({'created' if created else 'exists'})")

        for ex_data in EXERCISES:
            ex, created = Exercise.objects.get_or_create(
                concept=concept, slug=ex_data['slug'],
                defaults={k: v for k, v in ex_data.items() if k != 'slug'},
            )
            self.stdout.write(f"    Exercise: {ex.slug} ({'created' if created else 'exists'})")

        self.stdout.write(self.style.SUCCESS(
            f'Seeded capstone concept + {len(EXERCISES)} exercises under track {track_slug!r}.'
        ))
