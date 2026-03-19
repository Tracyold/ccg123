path = 'pages/account.tsx'
with open(path) as f:
    content = f.read()

# 1. Add WizardResultsTab import
content = content.replace(
    "import HomeTab from '../components/account/HomeTab';",
    "import HomeTab from '../components/account/HomeTab';\nimport WizardResultsTab from '../components/account/WizardResultsTab';"
)

# 2. Add Wizard Results to NAV
content = content.replace(
    "    { id: 'invoices', label: 'Invoices' },\n  ];",
    "    { id: 'wizard', label: 'Wizard Results' },\n    { id: 'invoices', label: 'Invoices' },\n  ];"
)

# 3. Add wizardPrefill state
content = content.replace(
    "  const [inquiryTab, setInquiryTab] = useState<'inquiries' | 'service'>('inquiries');",
    "  const [inquiryTab, setInquiryTab] = useState<'inquiries' | 'service'>('inquiries');\n  const [wizardPrefill, setWizardPrefill] = useState<any>(null);"
)

# 4. Add handleWizardServiceRequest before openSRForm
content = content.replace(
    "  const openSRForm = async () => {",
    "  const handleWizardServiceRequest = (result: any) => {\n"
    "    setWizardPrefill(result)\n"
    "    setActiveTab('inquiries')\n"
    "    setInquiryTab('service')\n"
    "    setShowSRForm(true)\n"
    "    setSrType(result.recommendation ?? '')\n"
    "    const stone = [result.stone_variety, result.stone_species].filter(Boolean).join(' ')\n"
    "    setSrDesc('Stone: ' + stone + '\\nWizard Score: ' + Math.round(result.feasibility_percent) + '%\\nRecommendation: ' + result.recommendation + '\\nWeight Loss Estimate: ' + result.weight_loss)\n"
    "  }\n\n"
    "  const openSRForm = async () => {"
)

# 5. Clear wizardPrefill on submit
content = content.replace(
    "    setSrSubmitting(false); setShowSRForm(false); setSrType(''); setSrDesc('');",
    "    setSrSubmitting(false); setShowSRForm(false); setSrType(''); setSrDesc(''); setWizardPrefill(null);"
)

# 6. Pass wizard_result_id in insert
content = content.replace(
    "      photo_url: null,\n    });",
    "      photo_url: null,\n      wizard_result_id: wizardPrefill?.id ?? null,\n    });"
)

# 7. Add wizard tab render
content = content.replace(
    "{activeTab === 'invoices' && <InvoiceList invoices={invoices} />}",
    "{activeTab === 'invoices' && <InvoiceList invoices={invoices} />}\n                {activeTab === 'wizard' && <WizardResultsTab onCreateServiceRequest={handleWizardServiceRequest} />}"
)

with open(path, 'w') as f:
    f.write(content)
print("Done.")
