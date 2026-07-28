const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('c:/Users/sures/Downloads/Mavixy-codes/wudgres-app/app/src');
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // We are looking for blocks of styling. Usually they look like:
    // title: {
    //    fontSize: 24,
    //    fontFamily: "Gilroy-Regular",
    // }
    
    // Let's use a regex to replace fontFamily: "Gilroy-Regular" with "Gilroy-Bold" 
    // inside styles that have names containing 'Title', 'Header', 'Heading', 'Subtitle', 'Name'
    
    let lines = content.split('\n');
    let insideHeadingStyle = false;
    let modified = false;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Detect start of a style rule that seems like a heading
        if (line.match(/(?:title|header|heading|subtitle|name|brand|code)\s*:/i) && line.includes('{')) {
            insideHeadingStyle = true;
        }
        // If we hit closing brace, we leave the style
        if (insideHeadingStyle && line.includes('}')) {
            insideHeadingStyle = false;
        }

        // If inside a heading style and we see Gilroy-Regular, change it to Gilroy-Bold
        if (insideHeadingStyle && line.includes('Gilroy-Regular')) {
            lines[i] = line.replace(/Gilroy-Regular/g, 'Gilroy-Bold');
            modified = true;
        }

        // Also check if there's a big fontSize inline, e.g., fontSize: 18 or theme.fontSize.xl
        // If there's a large font size and Gilroy-Regular, make it bold
        if (line.match(/fontSize:\s*(?:1[8-9]|[2-9]\d|theme\.fontSize\.(?:xl|xxl|xxxl))/)) {
             if (line.includes('Gilroy-Regular')) {
                 lines[i] = line.replace(/Gilroy-Regular/g, 'Gilroy-Bold');
                 modified = true;
             } else {
                 // if it's on a different line, we just do it in block parsing
             }
        }
    }
    
    // Pass 2: If a block has a big font size, make sure its Gilroy-Regular becomes Bold
    let blockStart = -1;
    let hasBigFont = false;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(': {')) {
            blockStart = i;
            hasBigFont = false;
        }
        if (blockStart !== -1) {
            if (lines[i].match(/fontSize:\s*(?:1[8-9]|[2-9]\d|theme\.fontSize\.(?:xl|xxl|xxxl))/)) {
                hasBigFont = true;
            }
            if (lines[i].includes('}')) {
                if (hasBigFont) {
                    for (let j = blockStart; j <= i; j++) {
                        if (lines[j].includes('Gilroy-Regular')) {
                            lines[j] = lines[j].replace(/Gilroy-Regular/g, 'Gilroy-Bold');
                            modified = true;
                        }
                    }
                }
                blockStart = -1;
            }
        }
    }

    if (modified) {
        fs.writeFileSync(file, lines.join('\n'));
        changedFiles++;
        console.log(`Updated headings in ${file}`);
    }
});

console.log(`Updated headings in ${changedFiles} files.`);
