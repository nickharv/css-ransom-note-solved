#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating CSS Ransom Note Requirements...\n');

try {
  // Read the CSS file
  console.log('Reading CSS file...');
  const cssPath = path.join(__dirname, '..', 'css', 'styles.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  console.log('CSS file read successfully');

  // Read the HTML file
  console.log('Reading HTML file...');
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  console.log('HTML file read successfully');

  let allPassed = true;

  // Check 1: At least 10 different unique styles
  console.log('📋 Checking for at least 10 unique styles...');
  const styleGroupComments = cssContent.match(/\/\* Style Group \d+.*?\*\//g);
  console.log('Style group comments found:', styleGroupComments?.length || 0);

  if (styleGroupComments && styleGroupComments.length >= 10) {
    console.log(`✅ Found ${styleGroupComments.length} style groups`);
  } else {
    console.log('❌ Need at least 10 unique style groups');
    allPassed = false;
  }

  // Check 2: Font weights (Bold, Normal, 400, 700)
  console.log('\n📋 Checking font weights...');
  const fontWeights = {
    bold: 0,
    normal: 0,
    400: 0,
    700: 0,
  };

  const weightMatches = cssContent.match(
    /font-weight:\s*(bold|normal|400|700)/g
  );
  if (weightMatches) {
    weightMatches.forEach((match) => {
      const weight = match.match(/font-weight:\s*(bold|normal|400|700)/)[1];
      fontWeights[weight]++;
    });
  }

  let weightsPassed = true;
  Object.entries(fontWeights).forEach(([weight, count]) => {
    if (count > 0) {
      console.log(`✅ ${weight}: ${count} times`);
    } else {
      console.log(`❌ ${weight}: missing`);
      weightsPassed = false;
    }
  });

  if (!weightsPassed) {
    allPassed = false;
  }

  // Check 3: Text decorations (Underline, Line-through, Overline, None)
  console.log('\n📋 Checking text decorations...');
  const textDecorations = {
    underline: 0,
    'line-through': 0,
    overline: 0,
    none: 0,
  };

  const decorationMatches = cssContent.match(
    /text-decoration:\s*(underline|line-through|overline|none)/g
  );
  if (decorationMatches) {
    decorationMatches.forEach((match) => {
      const decoration = match.match(
        /text-decoration:\s*(underline|line-through|overline|none)/
      )[1];
      textDecorations[decoration]++;
    });
  }

  let decorationsPassed = true;
  Object.entries(textDecorations).forEach(([decoration, count]) => {
    if (count > 0) {
      console.log(`✅ ${decoration}: ${count} times`);
    } else {
      console.log(`❌ ${decoration}: missing`);
      decorationsPassed = false;
    }
  });

  if (!decorationsPassed) {
    allPassed = false;
  }

  // Check 4: Text transformations (capitalized letters)
  console.log('\n📋 Checking text transformations...');
  const transformMatches = cssContent.match(
    /text-transform:\s*(uppercase|capitalize|lowercase)/g
  );
  if (transformMatches?.some((match) => match.includes('uppercase'))) {
    console.log('✅ Found uppercase transformation');
  } else {
    console.log('❌ Missing uppercase transformation');
    allPassed = false;
  }

  // Check 5: Font families (at least 6 Google Fonts)
  console.log('\n📋 Checking Google Fonts...');
  const fontFamilyMatches = cssContent.match(
    /font-family:\s*["']([^"']+)["']/g
  );
  const uniqueFonts = new Set();
  if (fontFamilyMatches) {
    fontFamilyMatches.forEach((match) => {
      const font = match.match(/font-family:\s*["']([^"']+)["']/)[1];
      uniqueFonts.add(font);
    });
  }

  if (uniqueFonts.size >= 6) {
    console.log(
      `✅ Found ${uniqueFonts.size} unique fonts: ${Array.from(uniqueFonts).join(', ')}`
    );
  } else {
    console.log(`❌ Need at least 6 unique fonts, found ${uniqueFonts.size}`);
    allPassed = false;
  }

  // Check 6: Color systems (at least 2)
  console.log('\n📋 Checking color systems...');
  const colorSystems = {
    hex: 0,
    rgb: 0,
    hsl: 0,
    rgba: 0,
    hsla: 0,
  };

  const hexMatches = cssContent.match(/#[0-9a-fA-F]{3,6}/g);
  const rgbMatches = cssContent.match(/rgb\([^)]+\)/g);
  const hslMatches = cssContent.match(/hsl\([^)]+\)/g);
  const rgbaMatches = cssContent.match(/rgba\([^)]+\)/g);
  const hslaMatches = cssContent.match(/hsla\([^)]+\)/g);

  if (hexMatches) colorSystems.hex = hexMatches.length;
  if (rgbMatches) colorSystems.rgb = rgbMatches.length;
  if (hslMatches) colorSystems.hsl = hslMatches.length;
  if (rgbaMatches) colorSystems.rgba = rgbaMatches.length;
  if (hslaMatches) colorSystems.hsla = hslaMatches.length;

  const usedColorSystems = Object.entries(colorSystems).filter(
    ([_, count]) => count > 0
  );
  if (usedColorSystems.length >= 2) {
    console.log(
      `✅ Found ${usedColorSystems.length} color systems: ${usedColorSystems.map(([system, count]) => `${system}(${count})`).join(', ')}`
    );
  } else {
    console.log(
      `❌ Need at least 2 color systems, found ${usedColorSystems.length}`
    );
    allPassed = false;
  }

  // Check 7: No inline styles in HTML
  console.log('\n📋 Checking for inline styles...');
  if (!htmlContent.includes('style=')) {
    console.log('✅ No inline styles found');
  } else {
    console.log('❌ Inline styles found - remove them');
    allPassed = false;
  }

  // Check 8: Grouped selectors
  console.log('\n📋 Checking for grouped selectors...');
  const groupedSelectors = cssContent.match(/[^}]+{[^}]*}/g);
  let hasGroupedSelectors = false;
  if (groupedSelectors) {
    hasGroupedSelectors = groupedSelectors.some(
      (rule) => rule.includes(',') && rule.includes('{')
    );
  }

  if (hasGroupedSelectors) {
    console.log('✅ Found grouped selectors');
  } else {
    console.log('❌ No grouped selectors found');
    allPassed = false;
  }

  // Final result
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 ALL REQUIREMENTS PASSED! 🎉');
    console.log('Your CSS Ransom Note meets all the project requirements.');
  } else {
    console.log('❌ SOME REQUIREMENTS FAILED');
    console.log('Please fix the issues above and run the validation again.');
  }
  console.log('='.repeat(50));

  process.exit(allPassed ? 0 : 1);
} catch (error) {
  console.error('Error during validation:', error);
  process.exit(1);
}
