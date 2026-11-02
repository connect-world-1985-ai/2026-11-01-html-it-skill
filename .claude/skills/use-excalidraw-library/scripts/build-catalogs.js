'use strict';

// Authoring-only. Regenerates references/catalog-*.md from libraries/*.
// Do not run during a drawing session. Runtime agents use the catalogs and
// stamp-library-item.js; they must not re-parse .excalidrawlib files.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const libDir = path.join(root, 'libraries');
const refDir = path.join(root, 'references');
fs.mkdirSync(refDir, { recursive: true });

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(libDir, file), 'utf8'));
}

function nativeSize(item) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const el of item.elements || []) {
    if (typeof el.x !== 'number' || typeof el.y !== 'number') continue;
    const w = typeof el.width === 'number' ? el.width : 0;
    const h = typeof el.height === 'number' ? el.height : 0;
    minX = Math.min(minX, el.x);
    minY = Math.min(minY, el.y);
    maxX = Math.max(maxX, el.x + w);
    maxY = Math.max(maxY, el.y + h);
  }
  const width = Number.isFinite(minX) ? Math.round(maxX - minX) : 0;
  const height = Number.isFinite(minY) ? Math.round(maxY - minY) : 0;
  return `${width} x ${height}`;
}

function bakedText(item) {
  return (item.elements || [])
    .filter((el) => el.type === 'text' && el.text)
    .map((el) => String(el.text).replace(/\s+/g, ' ').trim())
    .join('; ');
}

function table(rows) {
  const lines = ['| Name | Native size (px) | Notes |', '| --- | --- | --- |'];
  for (const row of rows) {
    const notes = (row.notes || '').replace(/\|/g, '/');
    lines.push(`| ${row.name} | ${row.size} | ${notes} |`);
  }
  return lines.join('\n');
}

function rowsFor(items, noteFn) {
  return items.map((it) => ({
    name: it.name,
    size: nativeSize(it),
    notes: noteFn ? noteFn(it) : bakedText(it),
  }));
}

const stick = load('stick-figures.excalidrawlib');
const stickNotes = {
  Happy: 'Face text ｡◕‿◕｡',
  Grandma: 'Tallest figure',
};
fs.writeFileSync(
  path.join(refDir, 'catalog-stick.md'),
  `# Stick figures

Pack \`stick\`. When to load: \`references/pack-index.md\`. Item menu only.

${table(rowsFor(stick.libraryItems, (it) => stickNotes[it.name] || bakedText(it)))}
`
);

const ux = load('basic-ux-wireframing-elements.excalidrawlib');
const uxGroups = [
  ['Toggles', (n) => /toggle/i.test(n)],
  ['Radios/Checkboxes', (n) => /radio|checkbox/i.test(n)],
  ['Buttons', (n) => /button|slider|check mark|go forward|go back|filled help|outlined help/i.test(n)],
  ['Inputs', (n) => /text field|text area|search field|dropdown/i.test(n)],
  ['Navigation', (n) => /hamburger|options/i.test(n) || n === 'Search'],
  ['Overlays', (n) => /modal|tooltip|cross|bulb/i.test(n)],
  ['Media', (n) => /image|photo|upload|videoplayer/i.test(n)],
];
const uxUsed = new Set();
const uxSections = [];
for (const [title, pred] of uxGroups) {
  const items = ux.libraryItems.filter((it) => pred(it.name) && !uxUsed.has(it.name));
  items.forEach((it) => uxUsed.add(it.name));
  if (items.length) uxSections.push(`## ${title}\n\n${table(rowsFor(items))}`);
}
const uxOther = ux.libraryItems.filter((it) => !uxUsed.has(it.name));
if (uxOther.length) uxSections.push(`## Other\n\n${table(rowsFor(uxOther))}`);
fs.writeFileSync(
  path.join(refDir, 'catalog-ux.md'),
  `# Basic UX wireframing elements

Pack \`ux\`. When to load: \`references/pack-index.md\`. Item menu only.

Native W×H in this catalog is authoring size, not drawn size. Scale the whole stamp to its hole (contain / match-height / match-width). Do not stretch filled buttons to fake product chrome; pair stamps with built-in frames. Baked labels include Search, Select, Drop files, Button, Open.

${uxSections.join('\n\n')}
`
);

const aws = load('aws-architecture-icons.excalidrawlib');
const awsGroups = [
  ['Analytics', ['CloudSearch', 'EMR', 'Lake Formation', 'Data Lake', 'Kinesis', 'Kinesis Video Streams', 'Kinesis Data Streams', 'Kinesis Data Firehose', 'Kinesis Data Analytics', 'Managed Service for Apache Flink', 'Glue', 'Crawler', 'DataCatalog', 'Elastic Views', 'OpenSearch Service', 'Redshift', 'QuickSight', 'Data Pipeline', 'Managed Streaming for Apache Kafka', 'Data Exchange', 'Glue DataBrew', 'DataZone', 'Business data catalog', 'Athena']],
  ['ML', ['Comprehend', 'Elastic Inference', 'Forecast', 'Lex', 'Personalize', 'Polly', 'Rekognition', 'SageMaker', 'Notebook', 'Canvas', 'Model', 'Train', 'Geospatial ML', 'Ground Truth', 'Textract', 'Transcribe', 'DeepComposer', 'Fraud Detector', 'Kendra', 'CodeGuru', 'DevOps Guru', 'Panorama', 'SageMaker Studio Lab', 'Comprehend Medical', 'CodeWhisperer', 'Augmented AI', 'Amazon Bedrock', 'Amazon Q']],
  ['Database', ['Aurora', 'DocumentDB', 'DynamoDB', 'DynamoDB Table', 'DAX', 'Stream', 'Keyspaces', 'DMS', 'Neptune', 'Timestream', 'RDS', 'Multi-AZ DB cluster', 'MemoryDB for Redis', 'ElastiCache', 'RDS instance', 'Aurora instance']],
  ['Storage', ['EBS', 'Storage Gateway', 'EFS', 'FSx', 'Snowball', 'Backup', 'S3', 'Glacier']],
  ['Compute and containers', ['EC2', 'AMI', 'Auto scaling', 'Instance', 'DB Instance', 'Instances', 'Spot instance', 'Instance with CloudWatch', 'Elastic Beanstalk', 'Lambda', 'EC2 Auto Scaling', 'Outposts', 'EC2 Image Builder', 'Elastic Fabric Adapter', 'App Runner', 'Batch', 'EKS', 'ECR', 'Registry', 'Image', 'ECS', 'Container', 'Container2', 'Task', 'Service', 'EKS Anywhere', 'Fargate']],
  ['App integration', ['SNS', 'SQS', 'Amazon MQ', 'AppSync', 'Step Functions', 'EventBridge', 'Event', 'Rule', 'Event bus', 'Scheduler', 'AppFlow', 'Managed Workflows for Apache Airflow']],
  ['IoT', ['IoT Analytics', 'IoT Core', 'Iot Greengrass', 'IoT SiteWise', 'IoT ExpressLink', 'IoT RoboRunner', 'IoT sensor', 'IoT topic', 'IoT Greengrass']],
  ['Developer tools', ['Cloud9', 'CodeBuild', 'CodeCommit', 'CodeDeploy', 'CodePipeline', 'AWS CLI', 'Tools and SDKs', 'X-Ray', 'CodeArtifact', 'CloudShell', 'Application Composer', 'Fault Injection Simulator', 'Amplify', 'Device Farm']],
  ['Management', ['CloudWatch', 'Alarm', 'Logs', 'Dashboard', 'CloudFormation', 'Application Auto Scaling', 'Config', 'License Manager', 'Personal Health Dashboard', 'OpsWorks', 'CloudTrail', 'Service Catalog', 'System Manager', 'Automation', 'Documents', 'Parameter Store', 'Incident Manager', 'Session Manager', 'Well-Arhitected Tool', 'Control Tower', 'Organizations', 'AppConfig', 'Chatbot', 'Backint Agent', 'Managed Service for Grafana', 'Managed Service for Prometheus', 'Distro for Open Telemetry', 'Resilience Hub']],
  ['Security', ['Cognito', 'GuardDuty', 'Inspector', 'Macie', 'Artifact', 'Certificate Manager', 'CloudHSM', 'Directory Service', 'Firewall Manager', 'IAM', 'Permissions', 'Role', 'AWS STS', 'KMS', 'Secrets Manager', 'Security Hub', 'Shield', 'IAM Identity Center', 'WAF', 'Detective', 'Resource Access Manager', 'Audit Manager', 'Network Firewall', 'Private Certificate Authority']],
  ['Networking', ['Transit Gateway', 'Attachment', 'CloudFront', 'Edge location', 'Route 53', 'Resolver', 'Route table', 'VPC', 'Internet gateway', 'VPN gateway', 'NAT gateway', 'Flow logs', 'Interface Endpoint', 'ENI', 'NACL', 'VPN Connection', 'Peering connection', 'Direct Connect', 'Global Accelerator', 'Client VPN', 'Site-to-Site VPN', 'ELB', 'ALB', 'NLB', 'GLB', 'PrivateLink', 'API Gateway', 'Endpoint']],
  ['Cost', ['Budgets', 'Cost & Usage Report', 'Cost Explorer', 'Saving Plans', 'Support']],
];

const awsUsed = new Set();
const awsByName = new Map(aws.libraryItems.map((it) => [it.name, it]));
const awsSections = [];
for (const [title, names] of awsGroups) {
  const items = [];
  for (const name of names) {
    if (awsByName.has(name) && !awsUsed.has(name)) {
      items.push(awsByName.get(name));
      awsUsed.add(name);
    }
  }
  if (items.length) awsSections.push({ title, items });
}
const leftover = aws.libraryItems.filter((it) => !awsUsed.has(it.name));
if (leftover.length) awsSections.push({ title: 'Other', items: leftover });

function slug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const toc = awsSections.map((s) => `- [${s.title}](#${slug(s.title)})`).join('\n');
fs.writeFileSync(
  path.join(refDir, 'catalog-aws.md'),
  `# AWS architecture icons

Pack \`aws\`. When to load: \`references/pack-index.md\`. Item menu only. This pack is 249 items (~3.9 MB). Load this catalog only after pre-flight selects aws.

## Contents

${toc}

${awsSections.map((s) => `## ${s.title}\n\n${table(rowsFor(s.items))}`).join('\n\n')}
`
);

const forms = load('forms.excalidrawlib');
const formsGroups = [
  ['Radios/Checkboxes', (n) => /radio|checkbox/i.test(n)],
  ['Buttons', (n) => /button/i.test(n)],
];
const formsUsed = new Set();
const formsSections = [];
for (const [title, pred] of formsGroups) {
  const items = forms.libraryItems.filter((it) => pred(it.name) && !formsUsed.has(it.name));
  items.forEach((it) => formsUsed.add(it.name));
  if (items.length) formsSections.push(`## ${title}\n\n${table(rowsFor(items))}`);
}
const formsOther = forms.libraryItems.filter((it) => !formsUsed.has(it.name));
if (formsOther.length) formsSections.push(`## Other\n\n${table(rowsFor(formsOther))}`);
fs.writeFileSync(
  path.join(refDir, 'catalog-forms.md'),
  `# Forms

Pack \`forms\`. When to load: \`references/pack-index.md\`. Item menu only.

${formsSections.join('\n\n')}
`
);

const systemDesign = load('system-design.excalidrawlib');
fs.writeFileSync(
  path.join(refDir, 'catalog-system-design.md'),
  `# System design

Pack \`system-design\`. When to load: \`references/pack-index.md\`. Item menu only.

${table(rowsFor(systemDesign.libraryItems))}
`
);

const emojis = load('emojis.excalidrawlib');
fs.writeFileSync(
  path.join(refDir, 'catalog-emojis.md'),
  `# Emojis

Pack \`emojis\`. When to load: \`references/pack-index.md\`. Item menu only.

${table(rowsFor(emojis.libraryItems))}
`
);

const bubbles = load('bubbles.excalidrawlib');
fs.writeFileSync(
  path.join(refDir, 'catalog-bubbles.md'),
  `# Bubbles

Pack \`bubbles\`. When to load: \`references/pack-index.md\`. Item menu only.

${table(rowsFor(bubbles.libraryItems))}
`
);

const postIt = load('post-it.excalidrawlib');
fs.writeFileSync(
  path.join(refDir, 'catalog-post-it.md'),
  `# Post-it

Pack \`post-it\`. When to load: \`references/pack-index.md\`. Item menu only.

${table(rowsFor(postIt.libraryItems))}
`
);

const awesomeIcons = load('awesome-icons.excalidrawlib');
fs.writeFileSync(
  path.join(refDir, 'catalog-awesome-icons.md'),
  `# Awesome icons

Pack \`awesome-icons\`. When to load: \`references/pack-index.md\`. Item menu only.

${table(rowsFor(awesomeIcons.libraryItems))}
`
);

const dataViz = load('data-viz.excalidrawlib');
const dataVizGroups = [
  ['Pie and polar', (n) => /pie|donut|polar|radar/i.test(n)],
  ['Bar and column', (n) => /bar|column|histogram|pyramid/i.test(n)],
  ['Line and area', (n) => /line|area|themeriver/i.test(n)],
  ['Scatter and heatmap', (n) => /scatter|^bubble$|dot |heatmap|tree map|waterfall/i.test(n)],
  ['Distribution', (n) => /density|box and whisker|violin/i.test(n)],
];
const dataVizUsed = new Set();
const dataVizSections = [];
for (const [title, pred] of dataVizGroups) {
  const items = dataViz.libraryItems.filter((it) => pred(it.name) && !dataVizUsed.has(it.name));
  items.forEach((it) => dataVizUsed.add(it.name));
  if (items.length) dataVizSections.push(`## ${title}\n\n${table(rowsFor(items))}`);
}
const dataVizOther = dataViz.libraryItems.filter((it) => !dataVizUsed.has(it.name));
if (dataVizOther.length) dataVizSections.push(`## Other\n\n${table(rowsFor(dataVizOther))}`);
fs.writeFileSync(
  path.join(refDir, 'catalog-data-viz.md'),
  `# Data viz

Pack \`data-viz\`. When to load: \`references/pack-index.md\`. Item menu only.

${dataVizSections.join('\n\n')}
`
);

const c4Architecture = load('c4-architecture.excalidrawlib');
fs.writeFileSync(
  path.join(refDir, 'catalog-c4-architecture.md'),
  `# C4 architecture

Pack \`c4-architecture\`. When to load: \`references/pack-index.md\`. Item menu only.

${table(rowsFor(c4Architecture.libraryItems))}
`
);

const dataProcessing = load('data-processing.excalidrawlib');
fs.writeFileSync(
  path.join(refDir, 'catalog-data-processing.md'),
  `# Data processing

Pack \`data-processing\`. When to load: \`references/pack-index.md\`. Item menu only.

${table(rowsFor(dataProcessing.libraryItems))}
`
);

const enterpriseIntegrationPatterns = load('enterprise-integration-patterns.excalidrawlib');
fs.writeFileSync(
  path.join(refDir, 'catalog-enterprise-integration-patterns.md'),
  `# Enterprise integration patterns

Pack \`enterprise-integration-patterns\`. When to load: \`references/pack-index.md\`. Item menu only.

${table(rowsFor(enterpriseIntegrationPatterns.libraryItems))}
`
);

const icons = load('icons.excalidrawlib');
fs.writeFileSync(
  path.join(refDir, 'catalog-icons.md'),
  `# Icons

Pack \`icons\`. When to load: \`references/pack-index.md\`. Item menu only.

${table(rowsFor(icons.libraryItems))}
`
);

const networkTopologyIcons = load('network-topology-icons.excalidrawlib');
fs.writeFileSync(
  path.join(refDir, 'catalog-network-topology-icons.md'),
  `# Network topology icons

Pack \`network-topology-icons\`. When to load: \`references/pack-index.md\`. Item menu only.

${table(rowsFor(networkTopologyIcons.libraryItems))}
`
);

const stickPeople = load('stick-people.excalidrawlib');
fs.writeFileSync(
  path.join(refDir, 'catalog-stick-people.md'),
  `# Stick people

Pack \`stick-people\`. When to load: \`references/pack-index.md\`. Item menu only.

${table(rowsFor(stickPeople.libraryItems))}
`
);

const umlClassEr = load('UML-ER-library.excalidrawlib');
fs.writeFileSync(
  path.join(refDir, 'catalog-uml-class-er.md'),
  `# UML class and ER

Pack \`uml-class-er\`. When to load: \`references/pack-index.md\`. Item menu only.

${table(rowsFor(umlClassEr.libraryItems, (it) => {
  if (it.name === 'Use case ellipse' || it.name === 'Actor') return 'use-case leftover; not a class';
  if (it.name === 'Lifeline' || it.name === 'Lifeline round') return 'sequence leftover; do not stamp as a lifeline';
  return bakedText(it);
}))}
`
);

const umlComponent = load('uml-component-diagram.excalidrawlib');
fs.writeFileSync(
  path.join(refDir, 'catalog-uml-component.md'),
  `# UML component

Pack \`uml-component\`. When to load: \`references/pack-index.md\`. Item menu only.

${table(rowsFor(umlComponent.libraryItems, (it) => {
  if (it.name === 'Dependency') return 'flat arrow, height 0; use contain or match-width';
  return bakedText(it);
}))}
`
);

const umlDeployment = load('uml-deployment-diagram.excalidrawlib');
fs.writeFileSync(
  path.join(refDir, 'catalog-uml-deployment.md'),
  `# UML deployment

Pack \`uml-deployment\`. When to load: \`references/pack-index.md\`. Item menu only.

${table(rowsFor(umlDeployment.libraryItems))}
`
);

const umlActivity = load('uml-library-activity-diagram.excalidrawlib');
fs.writeFileSync(
  path.join(refDir, 'catalog-uml-activity.md'),
  `# UML activity

Pack \`uml-activity\`. When to load: \`references/pack-index.md\`. Item menu only.

${table(rowsFor(umlActivity.libraryItems, (it) => {
  if (it.name === 'Expansion Description_Iterative') return 'baked typo iterartive';
  return bakedText(it);
}))}
`
);

function namesFromCatalog(file) {
  const text = fs.readFileSync(path.join(refDir, file), 'utf8');
  const names = [];
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\| ([^|]+) \|/);
    if (!match) continue;
    const name = match[1].trim();
    if (!name || name === 'Name' || /^-+$/.test(name)) continue;
    names.push(name);
  }
  return names;
}

let failed = false;
for (const [file, libfile] of [
  ['catalog-stick.md', 'stick-figures.excalidrawlib'],
  ['catalog-ux.md', 'basic-ux-wireframing-elements.excalidrawlib'],
  ['catalog-aws.md', 'aws-architecture-icons.excalidrawlib'],
  ['catalog-forms.md', 'forms.excalidrawlib'],
  ['catalog-system-design.md', 'system-design.excalidrawlib'],
  ['catalog-emojis.md', 'emojis.excalidrawlib'],
  ['catalog-bubbles.md', 'bubbles.excalidrawlib'],
  ['catalog-post-it.md', 'post-it.excalidrawlib'],
  ['catalog-awesome-icons.md', 'awesome-icons.excalidrawlib'],
  ['catalog-data-viz.md', 'data-viz.excalidrawlib'],
  ['catalog-c4-architecture.md', 'c4-architecture.excalidrawlib'],
  ['catalog-data-processing.md', 'data-processing.excalidrawlib'],
  ['catalog-enterprise-integration-patterns.md', 'enterprise-integration-patterns.excalidrawlib'],
  ['catalog-icons.md', 'icons.excalidrawlib'],
  ['catalog-network-topology-icons.md', 'network-topology-icons.excalidrawlib'],
  ['catalog-stick-people.md', 'stick-people.excalidrawlib'],
  ['catalog-uml-class-er.md', 'UML-ER-library.excalidrawlib'],
  ['catalog-uml-component.md', 'uml-component-diagram.excalidrawlib'],
  ['catalog-uml-deployment.md', 'uml-deployment-diagram.excalidrawlib'],
  ['catalog-uml-activity.md', 'uml-library-activity-diagram.excalidrawlib'],
]) {
  const libNames = load(libfile).libraryItems.map((it) => it.name);
  const catNames = namesFromCatalog(file);
  const missing = libNames.filter((n) => !catNames.includes(n));
  const extra = catNames.filter((n) => !libNames.includes(n));
  const dup = catNames.filter((n, i) => catNames.indexOf(n) !== i);
  console.log(file, 'lib', libNames.length, 'cat', catNames.length, 'missing', missing.length, 'extra', extra.length, 'dup', dup.length);
  if (missing.length || extra.length || dup.length) {
    failed = true;
    console.log(' missing', missing.slice(0, 30));
    console.log(' extra', extra.slice(0, 30));
    console.log(' dup', dup.slice(0, 30));
  }
}
if (failed) process.exit(1);
