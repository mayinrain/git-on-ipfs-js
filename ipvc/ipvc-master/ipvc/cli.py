import sys
import os
import shlex
import argparse
import cProfile
import shutil
from pathlib import Path

from ipvc_api import IPVC
import ipvc

def main():
    cwd = Path.cwd()
    desc = 'Inter-Planetary Versioning Control (System)'

    parser = argparse.ArgumentParser(description=desc)
    parser.add_argument(
        '-v', '--verbose', action='store_true', help='Verbose output')
    parser.add_argument(
        '-q', '--quiet', action='store_true', help='No printing to stdout')
    parser.add_argument(
        '-qr', '--quieter', action='store_true', help='No printing to stdout/stderr')
    parser.add_argument(
        '-p', '--profile', action='store_true', help='Profile the program')
    parser.add_argument(
        '-r', '--record', help='Record command as test, to output folder',
        default=None)
    parser.add_argument(
        '-n', '--mfs-namespace', help='IPFS/MFS namespace for IPVC', default=None)
    parser.add_argument(
        '-i', '--ipfs-ip', help='IPFS node ip and port string, e.g. "127.0.0.1:5001"',
        default=None)
    parser.add_argument(
        '-d', '--delete-mfs', action='store_true', help='Delete IPVC in IPFS/MFS before running command')
    parser.add_argument(
        '-c', '--cwd', help='Set the current working dir (cwd)')
    parser.set_defaults(command='help', subcommand='')
    subparsers = parser.add_subparsers()

    # ------------- HELP --------------
    help_parser = subparsers.add_parser('help', description='Display help')
    help_parser.set_defaults(command='help', subcommand='')

    version_parser = subparsers.add_parser('version', description='Display version')
    version_parser.set_defaults(command='version', subcommand='')

    # ------------- ID --------------
    id_parser = subparsers.add_parser('id', description='Identity functions')
    id_parser.set_defaults(command='id', subcommand='ls')
    id_subparsers = id_parser.add_subparsers()

    id_ls_parser = id_subparsers.add_parser(
        'ls', description='List all local and remote ids')
    id_ls_parser.set_defaults(subcommand='ls')
    id_ls_parser.add_argument(
        '-u', '--unused', action="store_true", help='Show unused IPFS keys')

    id_create_parser = id_subparsers.add_parser(
        'create', description='Create new id')
    id_create_parser.set_defaults(subcommand='create')
    id_create_parser.add_argument(
        'key', help='Key name')
    id_create_parser.add_argument(
        '-u', '--use', action="store_true", help='Use newly created key for this repo')

    id_get_parser = id_subparsers.add_parser(
        'get', description='Get identity used for repo or key')
    id_get_parser.set_defaults(subcommand='get')
    id_get_parser.add_argument(
        'key', nargs='?', help='Key name')

    id_set_parser = id_subparsers.add_parser(
        'set', description='Set identity parameters for key/repo')
    id_set_parser.set_defaults(subcommand='set')
    id_set_parser.add_argument(
        '--name', help='Name')
    id_set_parser.add_argument(
        '--email', help='Email')
    id_set_parser.add_argument(
        '--desc', help='Description')
    id_set_parser.add_argument(
        '--img', help='Profile image (IPFS hash)')
    id_set_parser.add_argument(
        '--link', help='Link to a website or IPFS hash')
    id_set_parser.add_argument(
        'key', nargs='?', help='Key name')

    id_publish_parser = id_subparsers.add_parser(
        'publish', description='Publish id parameters to IPNS for key/repo')
    id_publish_parser.set_defaults(subcommand='publish')
    id_publish_parser.add_argument(
        '--lifetime', default='8760h', help='Lifetime this identity will be valid, defaults to 1yr')
    id_publish_parser.add_argument(
        'key', nargs='?', help='Key name')

    id_resolve_parser = id_subparsers.add_parser(
        'resolve', description='Resolve info for remote ids seen in commits from IPNS`')
    id_resolve_parser.set_defaults(subcommand='resolve')
    id_resolve_parser.add_argument('--name', help='Remote name')
    id_resolve_parser.add_argument('--peer_id', help='Remote peer id')

    # ------------- REPO --------------
    repo_parser = subparsers.add_parser('repo', description='Repository functions')
    repo_parser.set_defaults(command='repo', subcommand='ls')
    repo_subparsers = repo_parser.add_subparsers()

    repo_ls_parser = repo_subparsers.add_parser(
        'ls', description='List all repos in IPFS node')
    repo_ls_parser.set_defaults(subcommand='ls')

    repo_init_parser = repo_subparsers.add_parser('init', description='Initialize a repo')
    repo_init_parser.set_defaults(subcommand='init')
    repo_init_parser.add_argument('name', nargs='?', help='Repo name', default=None)

    repo_mv_parser = repo_subparsers.add_parser('mv', description='Move a repo')
    repo_mv_parser.set_defaults(subcommand='mv')
    repo_mv_parser.add_argument(
        'path1', help='from path if narg=2 otherwise to path', default=cwd)
    repo_mv_parser.add_argument('path2', help='to path', default=None)

    repo_rm_parser = repo_subparsers.add_parser('rm', description='Remove a repo')
    repo_rm_parser.set_defaults(subcommand='rm')
    repo_rm_parser.add_argument('--path', help='Path to repo to remove', default=cwd)

    repo_id_parser = repo_subparsers.add_parser('id', description='Get/set ID for repo')
    repo_id_parser.set_defaults(subcommand='id')
    repo_id_parser.add_argument('key', nargs='?', help='Key name', default=None)

    repo_name_parser = repo_subparsers.add_parser('name', description='Get/set name for repo')
    repo_name_parser.set_defaults(subcommand='name')
    repo_name_parser.add_argument('name', nargs='?', help='Name', default=None)

    repo_publish_parser = repo_subparsers.add_parser(
        'publish', description='Publish repo (all branches) to IPNS')
    repo_publish_parser.set_defaults(subcommand='publish')
    repo_publish_parser.add_argument(
        '--lifetime', default='8760h', help='Lifetime of the new record, defaults to 1yr')

    repo_unpublish_parser = repo_subparsers.add_parser(
        'unpublish', description='Unpublish repo from IPNS')
    repo_unpublish_parser.set_defaults(subcommand='unpublish')
    repo_unpublish_parser.add_argument(
        '--lifetime', default='8760h', help='Lifetime of the new record, defaults to 1yr')

    repo_clone_parser = repo_subparsers.add_parser(
        'clone', description='Clone repo from IPNS')
    repo_clone_parser.set_defaults(subcommand='clone')
    repo_clone_parser.add_argument(
        '--as-name', help='Clone repo as name')
    repo_clone_parser.add_argument(
        'remote', help='Remote to clone from on the format "{PeerID}/{repository}"')

    # ------------- BRANCH --------------
    branch_parser = subparsers.add_parser(
        'branch', description='Handle branches')
    branch_parser.set_defaults(command='branch', subcommand='status')
    branch_subparsers = branch_parser.add_subparsers()

    branch_status_parser = branch_subparsers.add_parser(
        'status', description='Show status of current branch')
    branch_status_parser.add_argument(
        '-n', '--name', action="store_true", help="Print name of current branch only")

    branch_create_parser = branch_subparsers.add_parser(
        'create', description='Create a new branch and switch to it')
    branch_create_parser.set_defaults(subcommand='create')
    branch_create_parser.add_argument('name', help='branch name')
    branch_create_parser.add_argument('-f', '--from-commit', default="@head")
    branch_create_parser.add_argument(
        '-n', '--no-checkout', action="store_true", help="Don't checkout the new branch after creating it")

    branch_checkout_parser = branch_subparsers.add_parser(
        'checkout', description='Checkout a branch')
    branch_checkout_parser.set_defaults(subcommand='checkout')
    branch_checkout_parser.add_argument('name', help='branch name')
    branch_checkout_parser.add_argument(
        '--without-timestamps', action='store_true', help='Checkout files without timestamps (note this will slow down ipvc in the subsequent commands')

    branch_history_parser = branch_subparsers.add_parser(
        'history', description='Show branch commit history')
    branch_history_parser.set_defaults(subcommand='history')
    branch_history_parser.add_argument(
        '-s', '--show-hash', action='store_true', help='Shows hashes to commit content')

    branch_rewrite = branch_subparsers.add_parser(
        'rewrite', description='Rewrite branch history up to the last merge')
    branch_rewrite.set_defaults(subcommand='history')
    branch_rewrite.add_argument(
        '-n', '--num-ancestors', type=int, help=('Number of ancestors to include. '
        'If last merge is closer than n steps, then that number supercedes this parameter'),
        default=10)

    branch_show_parser = branch_subparsers.add_parser(
        'show', description='Show what\'s at a refpath (ls if folder, cat if file)')
    branch_show_parser.set_defaults(subcommand='show')
    branch_show_parser.add_argument(
        'refpath', nargs='?', help='The refpath (e.g. head or head~)', default='@head')
    branch_show_parser.add_argument(
        '-b', '--browser', action='store_true', help='Show the refpath in the default browser')

    branch_ls_parser = branch_subparsers.add_parser(
        'ls', description='List branches')
    branch_ls_parser.set_defaults(subcommand='ls')

    branch_merge_parser = branch_subparsers.add_parser(
        'merge', description='Merge changes from "their" branch into "our" branch')
    branch_merge_parser.set_defaults(subcommand='merge')
    branch_merge_parser.add_argument(
        '-n', '--no-ff', action='store_true',
        help='Creates a merge commit even where fast-forward merges can be made')
    branch_merge_parser.add_argument(
        '-a', '--abort', action='store_true', help='Aborts merge after a conflict')
    branch_merge_parser.add_argument(
        '-r', '--resolve', default=None, const=True, nargs='?', help='Resolve a merge conflict, with optional commit message')
    branch_merge_parser.add_argument(
        'their_branch', nargs='?', help='the name of their branch to pull changes from')

    branch_replay_parser = branch_subparsers.add_parser(
        'replay', description='Replay our changes on top of "their" commits (in our branch)')
    branch_replay_parser.set_defaults(subcommand='replay')
    branch_replay_parser.add_argument(
        '-a', '--abort', action='store_true', help='Aborts replay after a conflict')
    branch_replay_parser.add_argument(
        '-r', '--resume', action='store_true', help='Resume replay after a conflict has been resolved')
    branch_replay_parser.add_argument(
        'their_branch', nargs='?', help='the name of their branch')

    branch_publish_parser = branch_subparsers.add_parser(
        'publish', description='Publish branch to IPNS')
    branch_publish_parser.set_defaults(subcommand='publish')
    branch_publish_parser.add_argument('branch', nargs='?', help='The branch to publish', default=None)
    branch_publish_parser.add_argument(
        '--lifetime', default='8760h', help='Lifetime of the new record, defaults to 1yr')
    branch_publish_parser.add_argument(
        'branch', nargs='?', help='Branch to publish')

    branch_unpublish_parser = branch_subparsers.add_parser(
        'unpublish', description='Publish branch to IPNS')
    branch_unpublish_parser.set_defaults(subcommand='unpublish')
    branch_unpublish_parser.add_argument('branch', nargs='?', help='The branch to unpublish', default=None)
    branch_unpublish_parser.add_argument(
        '--lifetime', default='8760h', help='Lifetime of the new record, defaults to 1yr')
    branch_unpublish_parser.add_argument(
        'branch', nargs='?', help='Branch to unpublish')


    # ------------- STAGE --------------
    stage_parser = subparsers.add_parser(
        'stage', description='Add/remove changes to stage and handle commits')
    stage_parser.set_defaults(command='stage', subcommand='status')
    stage_subparsers = stage_parser.add_subparsers()

    stage_add_parser = stage_subparsers.add_parser(
        'add', description='Stage changes in a folder or file')
    stage_add_parser.set_defaults(subcommand='add')
    stage_add_parser.add_argument('fs_paths', nargs='*', help='path to add', default=cwd)

    stage_remove_parser = stage_subparsers.add_parser(
        'remove', description='Unstage changes in a folder or file')
    stage_remove_parser.set_defaults(subcommand='remove')
    stage_remove_parser.add_argument('fs_paths', nargs='*', help='path to remove', default=cwd)

    stage_status_parser = stage_subparsers.add_parser(
        'status', description='Show changed files between workspace, stage and head')
    stage_status_parser.set_defaults(subcommand='status')

    stage_commit_parser = stage_subparsers.add_parser(
        'commit', description='Commit staged changes')
    stage_commit_parser.set_defaults(subcommand='commit')
    stage_commit_parser.add_argument('-m', '--message', help='Commit message')

    stage_uncommit_parser = stage_subparsers.add_parser(
        'uncommit', description='Uncommit last commit and leave the changes staged')
    stage_uncommit_parser.set_defaults(subcommand='uncommit')

    stage_diff_parser = stage_subparsers.add_parser(
        'diff', description='Display diff between head and stage')
    stage_diff_parser.set_defaults(subcommand='diff')

    # ------------- DIFF --------------
    diff_parser = subparsers.add_parser(
        'diff', description='Display a diff between two ref paths, defaults to stage and workspace')
    diff_parser.set_defaults(command='diff', subcommand='run')
    diff_parser.add_argument(
        '-f', '--files', action='store_true', help='Shows a list of changed files only')
    diff_parser.add_argument('to_refpath', nargs='?', help='to refpath', default='@workspace')
    diff_parser.add_argument('from_refpath', nargs='?', help='from refpath', default='@stage')

    args = parser.parse_args()
    kwargs = dict(args._get_kwargs())
    # Pop commands that should not go to the route
    kwargs.pop('command')
    kwargs.pop('subcommand')
    kwargs.pop('profile')
    quiet = kwargs.pop('quiet')
    quieter = kwargs.pop('quieter')
    verbose = kwargs.pop('verbose')
    delete_mfs = kwargs.pop('delete_mfs')
    ipfs_ip = kwargs.pop('ipfs_ip')
    mfs_namespace = kwargs.pop('mfs_namespace')
    cwd = kwargs.pop('cwd') or cwd # Overwrite cwd with supplied path
    record_dir = kwargs.pop('record')

    n_path = None
    stdout_file, stderr_file = None, None
    if record_dir is not None:
        # Add quotes around args with spaces in them
        quoted_args = [shlex.quote(s) for s in sys.argv]

        # Replace the first script path with 'ipvc', and remove the
        # --record argument
        record_idx = quoted_args .index('--record')
        command = ('ipvc ' + ' '.join(quoted_args[1:record_idx]) + ' ' +
                   ' '.join(quoted_args[record_idx+2:]))

        num_states = 0
        for root, dirs, _ in os.walk(record_dir):
            for d in dirs:
                if d.isnumeric():
                    num_states += 1
            break

        n_path = Path(record_dir) / str(num_states)
        os.makedirs(n_path)
        shutil.copytree(cwd, n_path / 'pre')
        with open(n_path / 'command.txt', 'w') as f:
            f.write(command)
        stdout_file = open(n_path / 'stdout.txt', 'w')
        stderr_file = open(n_path / 'stderr.txt', 'w')

    if args.command == 'help':
        print('Use the --help option for help')
        exit(0)
    elif args.command == 'version':
        print(ipvc.__version__)
        exit(0)

    api = IPVC(quiet=quiet, quieter=quieter, verbose=verbose,
               mfs_namespace=mfs_namespace, ipfs_ip=ipfs_ip, cwd=cwd,
               delete_mfs=delete_mfs, stdout=stdout_file, stderr=stderr_file)
    route = getattr(getattr(api, args.command), args.subcommand)
    if args.profile:
        cProfile.run('route(**kwargs)')
    else:
        def _clean_up():
            if stdout_file is not None:
                stdout_file.close()
                stderr_file.close()
            if n_path:
                shutil.rmtree(n_path)
        try:
            route(**kwargs)
        except RuntimeError:
            _clean_up()
            exit(1)
        except:
            _clean_up()
            raise

    if record_dir is not None:
        shutil.copytree(cwd, n_path / 'post')
        stdout_file.close()
        stderr_file.close()
