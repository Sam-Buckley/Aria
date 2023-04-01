function format(code: string): string {
    const formattedLines = code.split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');
  
    let depth = 0;
    let inList = false;
  
    const formattedCode = formattedLines.reduce((result, line) => {
      if (line === ')') {
        depth--;
        inList = false;
        result += `\n${'\t'.repeat(depth)}${line}`;
      } else if (line.startsWith('(')) {
        if (inList) {
          result = result.trim();
          inList = false;
        }
        result += `\n${'\t'.repeat(depth)}${line}`;
        depth++;
      } else if (inList) {
        result += ` ${line.replace(/\s+/g, ' ')}`;
      } else {
        result += ` ${line}`;
      }
      if (line.endsWith('(')) {
        inList = true;
      }
      return result;
    }, '');
  
    return formattedCode.trim() + '\n';
  }
  
export default format;  