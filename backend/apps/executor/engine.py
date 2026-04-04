import os
import tempfile
import subprocess
from django.conf import settings

LANGUAGE_CONFIG = {
    'python': {
        'image': 'python:3.11-slim',
        'filename': 'solution.py',
        'test_filename': 'test_solution.py',
        'cmd': ['python', 'test_solution.py'],
        'cmd_no_test': ['python', 'solution.py'],
        'local_cmd': ['python3'],
    },
    'javascript': {
        'image': 'node:20-slim',
        'filename': 'solution.js',
        'test_filename': 'test_solution.js',
        'cmd': ['node', 'test_solution.js'],
        'cmd_no_test': ['node', 'solution.js'],
        'local_cmd': ['node'],
    },
    'typescript': {
        'image': 'node:20-slim',
        'filename': 'solution.ts',
        'test_filename': 'test_solution.ts',
        'cmd': ['npx', 'tsx', 'test_solution.ts'],
        'cmd_no_test': ['npx', 'tsx', 'solution.ts'],
        'local_cmd': ['npx', 'tsx'],
    },
}

TIMEOUT = getattr(settings, 'EXECUTOR_TIMEOUT', 10)
MEMORY_LIMIT = getattr(settings, 'EXECUTOR_MEMORY_LIMIT', '128m')


def execute_docker(code, language, test_code=''):
    """Execute code in an isolated Docker container."""
    import docker
    config = LANGUAGE_CONFIG[language]
    client = docker.from_env()

    with tempfile.TemporaryDirectory() as tmpdir:
        # Write code files
        with open(os.path.join(tmpdir, config['filename']), 'w') as f:
            f.write(code)

        if test_code:
            with open(os.path.join(tmpdir, config['test_filename']), 'w') as f:
                f.write(test_code)
            cmd = ' '.join(config['cmd'])
        else:
            cmd = ' '.join(config['cmd_no_test'])

        try:
            container = client.containers.run(
                config['image'],
                command=f"sh -c 'cd /code && {cmd}'",
                volumes={tmpdir: {'bind': '/code', 'mode': 'ro'}},
                mem_limit=MEMORY_LIMIT,
                network_disabled=True,
                remove=True,
                timeout=TIMEOUT,
                stdout=True,
                stderr=True,
                detach=True,
            )
            result = container.wait(timeout=TIMEOUT)
            stdout = container.logs(stdout=True, stderr=False).decode('utf-8', errors='replace')
            stderr = container.logs(stdout=False, stderr=True).decode('utf-8', errors='replace')
            try:
                container.remove(force=True)
            except Exception:
                pass
            return {
                'stdout': stdout,
                'stderr': stderr,
                'exit_code': result.get('StatusCode', 1),
                'timed_out': False,
            }
        except Exception as e:
            if 'timeout' in str(e).lower() or 'timed out' in str(e).lower():
                return {'stdout': '', 'stderr': 'Execution timed out', 'exit_code': 1, 'timed_out': True}
            return {'stdout': '', 'stderr': str(e), 'exit_code': 1, 'timed_out': False}


def execute_subprocess(code, language, test_code=''):
    """Fallback: execute code via subprocess (local dev without Docker)."""
    config = LANGUAGE_CONFIG[language]

    with tempfile.TemporaryDirectory() as tmpdir:
        with open(os.path.join(tmpdir, config['filename']), 'w') as f:
            f.write(code)

        if test_code:
            with open(os.path.join(tmpdir, config['test_filename']), 'w') as f:
                f.write(test_code)
            run_file = config['test_filename']
        else:
            run_file = config['filename']

        cmd = config['local_cmd'] + [run_file]

        try:
            result = subprocess.run(
                cmd,
                cwd=tmpdir,
                capture_output=True,
                text=True,
                timeout=TIMEOUT,
            )
            return {
                'stdout': result.stdout[:10000],
                'stderr': result.stderr[:10000],
                'exit_code': result.returncode,
                'timed_out': False,
            }
        except subprocess.TimeoutExpired:
            return {'stdout': '', 'stderr': 'Execution timed out', 'exit_code': 1, 'timed_out': True}
        except FileNotFoundError as e:
            return {'stdout': '', 'stderr': f'Runtime not found: {e}', 'exit_code': 1, 'timed_out': False}


def execute(code, language, test_code=''):
    """Try Docker first, fall back to subprocess."""
    try:
        import docker
        docker.from_env().ping()
        return execute_docker(code, language, test_code)
    except Exception:
        return execute_subprocess(code, language, test_code)
