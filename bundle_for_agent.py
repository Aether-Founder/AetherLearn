import os
import sys

def generate_agent_payload(root_dir, output_filename="agent_context.txt"):
    ignore_dirs = {'.git', 'node_modules', '__pycache__', 'venv', '.venv', 'build', 'dist', '.idea', '.vscode'}
    root_path = os.path.abspath(root_dir)
    script_name = os.path.basename(__file__)
    
    files_processed = 0
    print(f"Scanning directory: {root_path}...")

    with open(output_filename, 'w', encoding='utf-8') as out_file:
        for dirpath, dirnames, filenames in os.walk(root_path):
            dirnames[:] = [d for d in dirnames if d not in ignore_dirs]

            for filename in filenames:
                if filename in ['.DS_Store', script_name, output_filename]:
                    continue

                filepath = os.path.join(dirpath, filename)

                try:
                    # Safe relative path calculation
                    rel_path = "/" + os.path.relpath(filepath, root_path).replace('\\', '/')

                    # Quick binary check: look for null bytes in the first 1024 bytes
                    with open(filepath, 'rb') as f:
                        if b'\x00' in f.read(1024):
                            continue
                            
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    out_file.write(f'<WRITEFILE path="{rel_path}">\n')
                    out_file.write(content)
                    
                    if content and not content.endswith('\n'):
                        out_file.write('\n')
                        
                    out_file.write('</WRITEFILE>\n\n')
                    files_processed += 1

                except (UnicodeDecodeError, PermissionError, ValueError):
                    # ValueError catches the Windows mount-point crash
                    continue
                except Exception as e:
                    print(f"Warning: Could not process {filename} due to {e}")

    print(f"Done! Successfully grabbed {files_processed} files and saved them to '{output_filename}'.")

if __name__ == "__main__":
    target_directory = sys.argv[1] if len(sys.argv) > 1 else "."
    
    if not os.path.isdir(target_directory):
        print(f"Error: '{target_directory}' is not a valid directory.")
        sys.exit(1)
        
    generate_agent_payload(target_directory)
