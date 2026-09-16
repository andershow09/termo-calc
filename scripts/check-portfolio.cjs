const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const root = path.resolve(__dirname, '..');
const ignored = new Set(['.git', 'node_modules', 'www', '.angular', 'coverage', 'build', '.gradle', 'capacitor-cordova-android-plugins']);
const failures = [];
let count = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const file = path.join(dir, entry.name);
    const rel = path.relative(root, file).replaceAll('\\', '/');
    if (fs.lstatSync(file).isSymbolicLink()) { failures.push(rel + ': unexpected link'); continue; }
    if (entry.isDirectory()) { walk(file); continue; }
    count++;
    if (/\.(?:jks|keystore|p12|p8|pem|mobileprovision|apk|aab|ipa|pdf|db|sqlite|zip)$/i.test(rel) ||
        /(?:^|\/)(?:\.env(?:\..*)?|google-services\.json|GoogleService-Info\.plist|local\.properties)$/.test(rel)) {
      failures.push(rel + ': private or generated file');
    }
    if (/\.(?:png|jpeg|jpg|jar)$/i.test(rel)) continue;
    const text = fs.readFileSync(file, 'utf8');
    const rules = [
      ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
      ['cloud credential', /(?:AKIA|ASIA)[A-Z0-9]{16}|AIza[\w-]{30,}|gh[pousr]_[A-Za-z0-9]{30,}|glpat-[\w-]{15,}/],
      ['assigned credential', /(?:api[_-]?key|client[_-]?secret|password|access[_-]?token)\s*[:=]\s*['"][^'"\s]{8,}['"]/i],
      ['personal path', /[A-Z]:[\\/]Users[\\/][^\\/\s]+|\/Users\/[^/\s]+/],
      ['email address', /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i],
      ['private network address', /\b(?:192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)\b/],
    ];
    for (const [label, regex] of rules) if (regex.test(text)) failures.push(rel + ': ' + label);
  }
}
walk(root);
const engine = fs.readFileSync(path.join(root, 'src/app/core/services/calculate-flow.service.ts'), 'utf8');
if (!engine.includes('return { ...DEMO_RESULT }') || /Math\.|calculateEnthalpy|calculateDensity|calculateHeatFlow/.test(engine)) {
  failures.push('calculation engine must remain a fixed fixture');
}
const report = fs.readFileSync(path.join(root, 'src/app/core/services/report.service.ts'), 'utf8');
if (!report.includes('dados fictícios') || !report.includes('TermoCalcPortfolio')) failures.push('PDF demo marking/storage missing');
if (fs.existsSync(path.join(root, '.git'))) {
  const roots = cp.execFileSync('git', ['rev-list', '--max-parents=0', '--all'], { cwd: root, encoding: 'utf8' }).trim().split('\n');
  if (roots.length !== 1) failures.push('repository must have a single independent root');
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`Portfolio checks passed (${count} files). No matching sensitive patterns; calculation is a fixed demo.`);
