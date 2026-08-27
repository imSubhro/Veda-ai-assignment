const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createQuestionPaper() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  
  let y = height - 60;
  
  // Title
  page.drawText('Biology - Unit Test', { x: 180, y, size: 20, font: boldFont, color: rgb(0, 0, 0) });
  y -= 30;
  page.drawText('Class: 10  |  Time: 2 Hours  |  Marks: 50', { x: 160, y, size: 12, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 40;
  
  // Section A
  page.drawText('Section A (1 Mark each)', { x: 50, y, size: 14, font: boldFont });
  y -= 25;
  
  const questions = [
    { num: '1.', text: 'Which blood vessel carries blood away from the heart?', marks: '1' },
    { num: '2.', text: 'Which of the following organelles is primarily involved in photosynthesis?', marks: '1' },
    { num: '3.', text: 'What is the function of white blood cells?', marks: '1' },
    { num: '4.', text: 'Name the process by which plants lose water through leaves.', marks: '1' },
    { num: '5.', text: 'What is the structural and functional unit of kidney?', marks: '1' },
  ];
  
  questions.forEach(q => {
    page.drawText(`${q.num}  ${q.text}  [${q.marks}M]`, { x: 50, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) });
    y -= 22;
  });
  
  y -= 15;
  page.drawText('Section B (2 Marks each)', { x: 50, y, size: 14, font: boldFont });
  y -= 25;
  
  const questionsB = [
    { num: '6.', text: 'Explain the difference between arteries and veins with one example each.', marks: '2' },
    { num: '7.', text: 'Describe the structure of a nephron with a neat labelled diagram.', marks: '2' },
    { num: '8.', text: 'What is photosynthesis? Write the balanced chemical equation.', marks: '2' },
    { num: '9.', text: 'Explain the process of translocation in plants.', marks: '2' },
    { num: '10.', text: 'Describe the mechanism of breathing in humans.', marks: '2' },
  ];
  
  questionsB.forEach(q => {
    page.drawText(`${q.num}  ${q.text}  [${q.marks}M]`, { x: 50, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) });
    y -= 22;
  });
  
  y -= 15;
  page.drawText('Section C (5 Marks each)', { x: 50, y, size: 14, font: boldFont });
  y -= 25;
  
  const questionsC = [
    { num: '11.', text: 'Draw a labelled diagram of the human heart and explain the double circulation system.', marks: '5' },
    { num: '12.', text: 'Explain the transport of water and minerals in plants with a diagram.', marks: '5' },
  ];
  
  questionsC.forEach(q => {
    page.drawText(`${q.num}  ${q.text}  [${q.marks}M]`, { x: 50, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) });
    y -= 22;
    y -= 15;
  });
  
  const pdfBytes = await doc.save();
  const outputPath = path.join(__dirname, 'public', 'sample-question-paper.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log('Created: sample-question-paper.pdf');
}

async function createAnswerSheet() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  
  // Page 1
  const page1 = doc.addPage([595.28, 841.89]);
  const { width, height } = page1.getSize();
  
  let y = height - 60;
  
  page1.drawText('Student Answer Sheet', { x: 180, y, size: 18, font: boldFont });
  y -= 25;
  page1.drawText('Name: Rahul Sharma  |  Class: 10-A  |  Roll No: 15', { x: 130, y, size: 11, font, color: rgb(0.3, 0.3, 0.3) });
  y -= 40;
  
  // Answers
  page1.drawText('Q1.  Arteries carry blood away from the heart.', { x: 50, y, size: 11, font });
  y -= 20;
  page1.drawText('     Example: Aorta carries oxygenated blood from left ventricle', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 30;
  
  page1.drawText('Q2.  Chloroplast is the organelle involved in photosynthesis.', { x: 50, y, size: 11, font });
  y -= 20;
  page1.drawText('     It contains chlorophyll which captures light energy.', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 30;
  
  page1.drawText('Q3.  White blood cells protect the body against infections.', { x: 50, y, size: 11, font });
  y -= 20;
  page1.drawText('     They fight against bacteria and viruses.', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 30;
  
  page1.drawText('Q4.  Transpiration is the process by which plants lose water.', { x: 50, y, size: 11, font });
  y -= 20;
  page1.drawText('     It occurs mainly through stomata in leaves.', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 30;
  
  page1.drawText('Q5.  Nephron is the structural and functional unit of kidney.', { x: 50, y, size: 11, font });
  y -= 20;
  page1.drawText('     Each kidney contains about 1 million nephrons.', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 30;
  
  page1.drawText('Q6.  Arteries carry blood AWAY from heart:', { x: 50, y, size: 11, font });
  y -= 18;
  page1.drawText('     - Thick walls, no valves, carry oxygenated blood', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page1.drawText('     - Example: Pulmonary artery, Aorta', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 22;
  page1.drawText('     Veins carry blood TOWARDS heart:', { x: 50, y, size: 11, font });
  y -= 18;
  page1.drawText('     - Thin walls, have valves, carry deoxygenated blood', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page1.drawText('     - Example: Vena cava, Pulmonary vein', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 30;
  
  page1.drawText('Q7.  Nephron Structure:', { x: 50, y, size: 11, font });
  y -= 18;
  page1.drawText('     A nephron consists of:', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page1.drawText('     - Bowman\'s capsule: Cup-shaped structure that filters blood', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page1.drawText('     - Glomerulus: Network of capillaries inside Bowman\'s capsule', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page1.drawText('     - Renal tubule: Reabsorbs useful substances', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 30;
  
  // Page 2
  const page2 = doc.addPage([595.28, 841.89]);
  y = height - 60;
  
  page2.drawText('Q8.  Photosynthesis:', { x: 50, y, size: 11, font });
  y -= 18;
  page2.drawText('     The process by which green plants make their own food.', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page2.drawText('     Balanced equation:', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page2.drawText('     6CO2 + 6H2O  -->  C6H12O6 + 6O2', { x: 50, y, size: 11, font });
  y -= 18;
  page2.drawText('     (In presence of sunlight and chlorophyll)', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 30;
  
  page2.drawText('Q9.  Translocation:', { x: 50, y, size: 11, font });
  y -= 18;
  page2.drawText('     Transport of food (sucrose) from leaves to other parts.', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page2.drawText('     Occurs through phloem tissue.', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page2.drawText('     Food is transported from source (leaves) to sink (roots).', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 30;
  
  page2.drawText('Q10. Breathing mechanism:', { x: 50, y, size: 11, font });
  y -= 18;
  page2.drawText('     - Inhalation: Diaphragm contracts and flattens', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page2.drawText('     - Intercostal muscles contract, ribs move outward', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page2.drawText('     - Chest cavity volume increases, air rushes in', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page2.drawText('     - Exhalation is the reverse process', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 30;
  
  page2.drawText('Q11. Human Heart & Double Circulation:', { x: 50, y, size: 11, font });
  y -= 18;
  page2.drawText('     The human heart has 4 chambers: 2 atria and 2 ventricles.', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page2.drawText('     Double circulation means blood passes through heart twice.', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page2.drawText('     1. Pulmonary circulation: Heart -> Lungs -> Heart', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page2.drawText('     2. Systemic circulation: Heart -> Body -> Heart', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page2.drawText('     This ensures efficient supply of oxygen to all body parts.', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 30;
  
  page2.drawText('Q12. Transport of water and minerals:', { x: 50, y, size: 11, font });
  y -= 18;
  page2.drawText('     - Water is absorbed by root hairs from soil', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page2.drawText('     - Moves through root cortex by osmosis', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page2.drawText('     - Enters xylem vessels', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page2.drawText('     - Transpiration pull moves water upward', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  y -= 18;
  page2.drawText('     - Minerals are transported along with water', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  
  const pdfBytes = await doc.save();
  const outputPath = path.join(__dirname, 'public', 'sample-answer-sheet.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log('Created: sample-answer-sheet.pdf');
}

async function main() {
  await createQuestionPaper();
  await createAnswerSheet();
  console.log('\nDone! Files saved in public/ folder');
  console.log('Upload sample-question-paper.pdf and sample-answer-sheet.pdf to test.');
}

main().catch(console.error);
