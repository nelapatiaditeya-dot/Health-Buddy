document.addEventListener('DOMContentLoaded', () => {
    // Add your OpenAI API key here (or fallback will be used)
    const API_KEY = "PASTE_API_KEY_HERE";

    // 1. CHATBOT RULES & TRANSLATIONS
    const translations = {
      en: {
        greeting: "Hello! I'm HealthBuddy AI 👨‍⚕️.\n\nYour personal healthcare assistant.\nYou can ask me about symptoms, medicines, first aid, or general health advice.\n\nHow can I help you today?",
        listening: "Listening...",
        voiceNotSupported: "Voice input is not supported in your browser.",
        voiceError: "Sorry, I didn't catch that. Please try again."
      },
      hi: {
        greeting: "नमस्ते! मैं हेल्थ बडी असिस्टेंट हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
        listening: "सुन रहा हूँ...",
        voiceNotSupported: "वॉइस इनपुट आपके ब्राउज़र में समर्थित नहीं है।",
        voiceError: "क्षमा करें, मुझे समझ नहीं आया। पुनः प्रयास करें।"
      },
      te: {
        greeting: "నమస్కారం! నేను హెల్త్ బడ్డీ అసిస్టెంట్. నేను మీకు ఎలా సహాయపడగలను?",
        listening: "వింటున్నాను...",
        voiceNotSupported: "వాయిస్ ఇన్పుట్ మద్దతు లేదు.",
        voiceError: "క్షమించండి, నాకు అర్థం కాలేదు."
      }
    };

    // 2. UI ELEMENTS
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const chatWindow = document.getElementById('chatWindow');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatMessages = document.getElementById('chatMessages');
    const chatVoiceBtn = document.getElementById('chatVoiceBtn');
    const languageSelector = document.getElementById('languageSelector');

    let currentLanguage = 'en';
    let conversationHistory = []; // Tracks memory for the session

    if (languageSelector) {
        languageSelector.addEventListener('change', (e) => {
            currentLanguage = e.target.value;
            chatMessages.innerHTML = '';
            showWelcomeAndSuggestions();
        });
    }

    if (chatToggleBtn && chatWindow) {
        chatToggleBtn.addEventListener('click', () => {
            chatWindow.classList.add('active');
            chatToggleBtn.style.display = 'none';
            chatInput.focus();
            if(chatMessages.children.length === 0) {
                showWelcomeAndSuggestions();
            }
        });
    }

    // Auto-load welcome message when script initializes on full page
    window.addEventListener('load', () => {
        if (document.querySelector('.chatbot-page') && chatMessages && chatMessages.children.length === 0) {
            showWelcomeAndSuggestions();
        }

        if(window.location.search.includes("symptom")){
            if (chatInput) {
                chatInput.focus();
            }
        }
    });

    // --- SHOW WELCOME & SUGGESTED QUESTIONS ---
    function showWelcomeAndSuggestions() {
        addMessage(translations[currentLanguage].greeting, 'bot');
        
        const suggestionsMap = {
            en: ["Fever Medicine", "Headache Help", "Cold & Cough", "Period Pain", "Hydration Advice", "Stress Relief"],
            te: ["జ్వరం మందులు", "తలనొప్పి సహాయం", "జలుబు & దగ్గు", "నెలసరి నొప్పి", "హైడ్రేషన్ సలహా", "ఒత్తిడి నివారణ"],
            hi: ["बुखार की दवा", "सिरदर्द में मदद", "सर्दी और खांसी", "मासिक धर्म का दर्द", "हाइड्रेशन सलाह", "तनाव से राहत"]
        };
        
        const suggestions = suggestionsMap[currentLanguage] || suggestionsMap['en'];
        
        const suggContainer = document.createElement('div');
        suggContainer.className = 'suggestion-chips';
        
        suggestions.forEach(text => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-chip';
            btn.innerText = text;
            btn.onclick = () => {
                handleSuggestedQuestion(text);
                suggContainer.remove();
            };
            suggContainer.appendChild(btn);
        });
        chatMessages.appendChild(suggContainer);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    const responses = {
        fever: {
            en: `Possible Condition:\nMild fever caused by viral infection.\n\nRecommended Medicine:\n• Paracetamol 500mg\n• Ibuprofen (if prescribed)\n\nHome Care:\n• Drink warm fluids\n• Rest well\n• Take sponge baths\n\nFood Advice:\n• Soup\n• Coconut water\n• Fruits rich in vitamin C\n\nDoctor Consultation:\nIf fever lasts more than 3 days consult a doctor.`,
            te: `సంభావ్య పరిస్థితి:\nవైరల్ ఇన్ఫెక్షన్ వల్ల వచ్చే తేలికపాటి జ్వరం.\n\nసూచించిన మందులు:\n• ప్యారాసెటమాల్ 500mg\n• ఐబుప్రోఫెన్ (డాక్టర్ సూచనతో)\n\nఇంటి చికిత్స:\n• వేడి ద్రవాలు తాగండి\n• విశ్రాంతి తీసుకోండి\n• తడి గుడ్డతో శరీరాన్ని తుడవండి\n\nఆహార సలహా:\n• సూప్\n• కొబ్బరి నీరు\n• విటమిన్ సి ఉన్న పండ్లు\n\nడాక్టర్ సంప్రదింపులు:\nజ్వరం 3 రోజుల కంటే ఎక్కువ ఉంటే డాక్టర్‌ను సంప్రదించండి.`,
            hi: `संभावित स्थिति:\nवायरल संक्रमण के कारण हल्का बुखार।\n\nसुझाई गई दवाएं:\n• पैरासिटामोल 500mg\n• इबुप्रोफेन (डॉक्टर की सलाह से)\n\nघरेलू देखभाल:\n• गर्म तरल पदार्थ पिएं\n• आराम करें\n• ठंडे पानी की पट्टियाँ रखें\n\nभोजन की सलाह:\n• सूप\n• नारियल पानी\n• विटामिन सी युक्त फल\n\nडॉक्टर से परामर्श:\nयदि बुखार 3 दिन से अधिक समय तक रहता है तो डॉक्टर से परामर्श लें।`
        },
        cold: {
            en: `Possible Condition:\nCommon cold or respiratory infection.\n\nSuggested Medicines:\n• Antihistamines\n• Cough syrup\n• Paracetamol (if fever)\n\nHome Remedies:\n• Steam inhalation\n• Honey with warm water\n• Ginger tea\n\nFood Recommendations:\n• Warm soups\n• Herbal tea\n• Vitamin C fruits\n\nConsult a doctor if symptoms persist beyond 5 days.`,
            te: `సంభావ్య పరిస్థితి:\nసాధారణ జలుబు లేదా శ్వాసకోశ ఇన్ఫెక్షన్.\n\nసూచించిన మందులు:\n• యాంటిహిస్టామైన్లు\n• దగ్గు సిరప్\n• ప్యారాసెటమాల్ (జ్వరం ఉంటే)\n\nఇంటి చికిత్స:\n• ఆవిరి పట్టడం\n• వేడి నీటిలో తేనె\n• అల్లం టీ\n\nఆహార సలహా:\n• వేడి సూప్‌లు\n• హెర్బల్ టీ\n• విటమిన్ సి పండ్లు\n\nలక్షణాలు 5 రోజుల కంటే ఎక్కువ ఉంటే డాక్టర్‌ను సంప్రదించండి.`,
            hi: `संभावित स्थिति:\nसामान्य सर्दी या श्वसन संक्रमण।\n\nसुझाई गई दवाएं:\n• एंटीहिस्टामाइन\n• खांसी का सिरप\n• पैरासिटामोल (बुखार होने पर)\n\nघरेलू उपाय:\n• भाप लें\n• गर्म पानी के साथ शहद\n• अदरक की चाय\n\nभोजन की सलाह:\n• गर्म सूप\n• हर्बल चाय\n• विटामिन सी वाले फल\n\nयदि लक्षण 5 दिन से अधिक समय तक रहते हैं तो डॉक्टर से परामर्श लें।`
        },
        headache: {
            en: `Possible Causes:\nStress, dehydration, lack of sleep.\n\nRelief Tips:\n• Drink water\n• Rest in a quiet room\n• Apply cold compress\n\nSuggested Medicine:\n• Paracetamol\n• Ibuprofen (if required)\n\nLifestyle Advice:\n• Reduce screen time\n• Sleep 7-8 hours`,
            te: `సంభావ్య కారణాలు:\nఒత్తిడి, డీహైడ్రేషన్, నిద్రలేమి.\n\nఉపశమన చిట్కాలు:\n• నీరు తాగండి\n• నిశ్శబ్ద గదిలో విశ్రాంతి తీసుకోండి\n• కోల్డ్ కంప్రెస్ అప్లై చేయండి\n\nసూచించిన మందులు:\n• ప్యారాసెటమాల్\n• ఐబుప్రోఫెన్ (అవసరమైతే)\n\nజీవనశైలి సలహా:\n• స్క్రీన్ సమయం తగ్గించండి\n• 7-8 గంటలు నిద్రపోండి`,
            hi: `संभावित कारण:\nतनाव, निर्जलीकरण, नींद की कमी।\n\nराहत के सुझाव:\n• पानी पिएं\n• एक शांत कमरे में आराम करें\n• कोल्ड कंप्रेस लगाएं\n\nसुझाई गई दवा:\n• पैरासिटामोल\n• इबुप्रोफेन (यदि आवश्यक हो)\n\nजीवन शैली की सलाह:\n• स्क्रीन का समय कम करें\n• 7-8 घंटे की नींद लें`
        },
        period: {
            en: `Common Issue:\nMenstrual cramps.\n\nRelief Methods:\n• Warm heating pad\n• Light stretching\n• Rest\n\nMedicines:\n• Ibuprofen\n• Naproxen\n\nFood Suggestions:\n• Iron-rich foods\n• Warm herbal tea\n• Avoid caffeine`,
            te: `సాధారణ సమస్య:\nఋతుస్రావ నొప్పి (క్రాంప్స్).\n\nఉపశమన పద్ధతులు:\n• పొత్తికడుపుపై వేడి ప్యాడ్ ఉపయోగించండి\n• తేలికపాటి సాగదీయడం\n• విశ్రాంతి\n\nమందులు:\n• ఐబుప్రోఫెన్\n• నాప్రోక్సెన్\n\nఆహార సూచనలు:\n• ఐరన్ అధికంగా ఉన్న ఆహారాలు\n• వేడి హెర్బల్ టీ\n• కెఫిన్ మానుకోండి`,
            hi: `सामान्य समस्या:\nमासिक धर्म में ऐंठन।\n\nराहत के तरीके:\n• गर्म हीटिंग पैड\n• हल्का व्यायाम\n• आराम\n\nदवाएं:\n• इबुप्रोफेन\n• नेप्रोक्सन\n\nभोजन के सुझाव:\n• आयरन युक्त भोजन\n• गर्म हर्बल चाय\n• कैफीन से बचें`
        },
        hydration: {
            en: `Hydration Tips:\n• Drink 2–3 liters of water daily\n• Consume coconut water\n• Eat fruits like watermelon and oranges\n\nSigns of dehydration:\n• Headache\n• Fatigue\n• Dry mouth\n\nIf severe dehydration occurs consult a doctor.`,
            te: `హైడ్రేషన్ చిట్కాలు:\n• రోజూ 2–3 లీటర్ల నీరు త్రాగాలి\n• కొబ్బరి నీరు త్రాగాలి\n• పుచ్చకాయ మరియు నారింజ లాంటి పండ్లు తినాలి\n\nడీహైడ్రేషన్ లక్షణాలు:\n• తలనొప్పి\n• అలసట\n• నోరు ఎండిపోవడం\n\nతీవ్రమైన డీహైడ్రేషన్ ఉంటే డాక్టర్‌ను సంప్రదించండి.`,
            hi: `हाइड्रेशन टिप्स:\n• रोजाना 2-3 लीटर पानी पिएं\n• नारियल पानी का सेवन करें\n• तरबूज और संतरा जैसे फल खाएं\n\nनिर्जलीकरण के संकेत:\n• सिरदर्द\n• थकान\n• मुंह सूखना\n\nयदि गंभीर निर्जलीकरण होता है तो डॉक्टर से परामर्श लें।`
        },
        stress: {
            en: `Mental Health Advice:\n• Practice deep breathing\n• Do light exercise\n• Take breaks from work\n\nHelpful habits:\n• Meditation\n• Listening to calming music\n• Talking to friends\n\nIf stress persists consider consulting a mental health professional.`,
            te: `మానసిక ఆరోగ్య సలహా:\n• దీర్ఘ శ్వాస సాధన చేయండి\n• తేలికపాటి వ్యాయామం చేయండి\n• పని నుండి విరామం తీసుకోండి\n\nసహాయక అలవాట్లు:\n• ధ్యానం\n• ప్రశాంతమైన సంగీతం వినడం\n• స్నేహితులతో మాట్లాడటం\n\nఒత్తిడి కొనసాగితే మానసిక ఆరోగ్య నిపుణుడిని సంప్రదించండి.`,
            hi: `मानसिक स्वास्थ्य सलाह:\n• गहरी सांस लेने का अभ्यास करें\n• हल्का व्यायाम करें\n• काम से ब्रेक लें\n\nमददगार आदतें:\n• ध्यान (Meditation)\n• शांत संगीत सुनना\n• दोस्तों से बात करना\n\nयदि तनाव बना रहता है तो मानसिक स्वास्थ्य पेशेवर से परामर्श लें।`
        },
        vomiting: {
            en: `Possible Condition:\nFood poisoning, indigestion, or gastric issue.\n\nCare Advice:\n• Avoid heavy meals\n• Rest your stomach\n• Drink clear fluids slowly\n\nSuggested Medicine:\n• Antacid (for indigestion)\n• ORS (Oral Rehydration Salts)\n\nDoctor Consultation:\nIf vomiting lasts more than 24 hours or pain is severe.`,
            te: `సంభావ్య పరిస్థితి:\nఫుడ్ పాయిజనింగ్, అజీర్ణం లేదా గ్యాస్ట్రిక్ సమస్య.\n\nసంరక్షణ సలహా:\n• భారీ భోజనం మానుకోండి\n• కడుపుకు విశ్రాంతి ఇవ్వండి\n• స్పష్టమైన ద్రవాలను నెమ్మదిగా త్రాగాలి\n\nసూచించిన మందులు:\n• యాంటాసిడ్ (అజీర్ణం కోసం)\n• ORS (ఓరల్ రీహైడ్రేషన్ సాల్ట్స్)\n\nడాక్టర్ సంప్రదింపులు:\nవాంతులు 24 గంటల కంటే ఎక్కువ ఉంటే లేదా తీవ్రమైన నొప్పి ఉంటే.`,
            hi: `संभावित स्थिति:\nफूड पॉइजनिंग, अपच, या गैस्ट्रिक समस्या।\n\nदेखभाल सलाह:\n• भारी भोजन से बचें\n• अपने पेट को आराम दें\n• साफ तरल पदार्थ धीरे-धीरे पिएं\n\nसुझाई गई दवा:\n• एंटासिड (अपच के लिए)\n• ओआरएस (ओरल रिहाइड्रेशन साल्ट्स)\n\nडॉक्टर से परामर्श:\nयदि उल्टी 24 घंटे से अधिक समय तक रहती है या दर्द गंभीर है।`
        }
    };

    function getLocalResponse(message) {
        const msg = message.toLowerCase();
        
        if (msg.includes("fever") || msg.includes("జ్వరం") || msg.includes("बुखार")) {
            return responses.fever[currentLanguage];
        }
        if (msg.includes("cold") || msg.includes("cough") || msg.includes("జలుబు") || msg.includes("దగ్గు") || msg.includes("सर्दी") || msg.includes("खांसी")) {
            return responses.cold[currentLanguage];
        }
        if (msg.includes("headache") || msg.includes("తలనొప్పి") || msg.includes("सिरदर्द")) {
            return responses.headache[currentLanguage];
        }
        if (msg.includes("period") || msg.includes("cramps") || msg.includes("నెలసరి") || msg.includes("నొప్పి") || msg.includes("मासिक") || msg.includes("ऐंठन")) {
            return responses.period[currentLanguage];
        }
        if (msg.includes("hydration") || msg.includes("water") || msg.includes("నీరు") || msg.includes("డీహైడ్రేషన్") || msg.includes("హైడ్రేషన్") || msg.includes("पानी") || msg.includes("निर्जलीकरण") || msg.includes("हाइड्रेशन")) {
            return responses.hydration[currentLanguage];
        }
        if (msg.includes("stress") || msg.includes("ఒత్తిడి") || msg.includes("तनाव")) {
            return responses.stress[currentLanguage];
        }
        if (msg.includes("vomiting") || msg.includes("stomach") || msg.includes("వాంతులు") || msg.includes("కడుపు") || msg.includes("उल्टी") || msg.includes("पेट")) {
            return responses.vomiting[currentLanguage];
        }
        return null;
    }

    function handleSuggestedQuestion(question) {
        addMessage(question, 'user');
        conversationHistory.push({ role: "user", content: question });

        const detectedSymptoms = detectSymptomsFromMessage(question);
        detectedSymptoms.forEach(sym => saveSymptom(sym));

        let response = getLocalResponse(question);

        if (response) {
            conversationHistory.push({ role: "assistant", content: response });
            addMessage(response, 'bot');
            
            let detectedMedicines = extractMedicines(response);
            detectedMedicines.forEach(m => saveMedicine(m));
        }
    }

    // 3. STOP SPEECH SYNTHESIS
    function stopSpeech() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }

    // Stop speech when page unloads, refreshes, or tab changes
    window.addEventListener("beforeunload", stopSpeech);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopSpeech();
    });

    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', () => {
            stopSpeech();
            chatWindow.classList.remove('active');
            chatToggleBtn.style.display = 'flex';
        });
    }

    // Clear Chat Button Logic
    const clearChatBtn = document.getElementById('clearChatBtn');
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', () => {
            chatMessages.innerHTML = '';
            conversationHistory = [];
            showWelcomeAndSuggestions();
        });
    }

    // 4. STORAGE
    function saveSymptom(symptomKey) {
        const data = JSON.parse(sessionStorage.getItem('symptoms')) || [];
        const cleanSymptom = symptomKey.replace(/_/g, ' ');
        const lastEntry = data.length > 0 ? data[data.length - 1] : null;
        if (lastEntry && lastEntry.symptom === cleanSymptom && (new Date() - new Date(lastEntry.timestamp) < 2000)) {
            return;
        }
        data.push({
            symptom: cleanSymptom,
            timestamp: new Date().toISOString()
        });
        sessionStorage.setItem('symptoms', JSON.stringify(data));
        window.dispatchEvent(new Event('storage'));
    }

    const commonMedicines = [
        "paracetamol",
        "ibuprofen",
        "antihistamine",
        "cough syrup",
        "cetirizine",
        "azithromycin",
        "vitamin c",
        "ors",
        "dolo"
    ];

    function extractMedicines(responseText) {
        let detected = [];
        let textToSearch = typeof responseText === 'string' ? responseText : JSON.stringify(responseText);
        commonMedicines.forEach(med => {
            if(textToSearch.toLowerCase().includes(med)){
                detected.push(med);
            }
        });
        return detected;
    }

    function detectSymptomsFromMessage(message) {
        const msg = message.toLowerCase();
        const detected = [];
        if (msg.includes("fever") || msg.includes("జ్వరం") || msg.includes("बुखार") || msg.includes("bukhar") || msg.includes("temperature")) {
            detected.push("fever");
        }
        if (msg.includes("cold") || msg.includes("cough") || msg.includes("sneeze") || msg.includes("జలుబు") || msg.includes("దగ్గు") || msg.includes("सर्दी") || msg.includes("खांसी")) {
            detected.push("cold");
        }
        if (msg.includes("headache") || msg.includes("migraine") || msg.includes("తలనొప్పి") || msg.includes("सिरदर्द")) {
            detected.push("headache");
        }
        if (msg.includes("body pain") || msg.includes("weakness") || msg.includes("body ache") || msg.includes("నొప్పి") || msg.includes("दर्द") || msg.includes("cramps")) {
            detected.push("body pain");
        }
        return detected;
    }

    function saveMedicine(medicineKey) {
        let stored = JSON.parse(localStorage.getItem("healthBuddyMedicines")) || [];
        const lastEntry = stored.length > 0 ? stored[stored.length - 1] : null;
        if (lastEntry && lastEntry.name === medicineKey && (Date.now() - lastEntry.time < 2000)) {
            // Prevent duplicating identical inputs consecutively
        } else {
            stored.push({
                name: medicineKey,
                time: Date.now()
            });
            localStorage.setItem("healthBuddyMedicines", JSON.stringify(stored));
        }
        
        const data = JSON.parse(sessionStorage.getItem('medicines')) || [];
        data.push({
            medicine: medicineKey,
            timestamp: new Date().toISOString()
        });
        sessionStorage.setItem('medicines', JSON.stringify(data));
        window.dispatchEvent(new Event('storage'));
    }

    // Fallback response system when AI API fails or key is missing
    function getFallbackResponse(message) {
        const localResp = getLocalResponse(message);
        if (localResp) {
            return localResp;
        }
        
        const msg = message.toLowerCase();
        
        if (msg.includes('burn')) {
            return {
                reply: "I can help with first aid for burns.",
                condition: "Thermal injury to the skin.",
                care_advice: ["Run cool water over the burn for 10 minutes.", "Do not apply ice.", "Apply burn ointment.", "Cover loosely with sterile gauze."],
                medicines: ["Pain relievers like Ibuprofen if needed"],
                doctor_visit: "Seek medical help if blistering occurs or if the burn is severe.",
                symptoms: ["burn"], suggested_medicines: ["burn ointment"]
            };
        }
        if (msg.includes('below 100')) {
            return {
                reply: "Based on your temperature:",
                condition: "Mild fever or body temperature fluctuation.",
                care_advice: ["Rest well", "Drink warm fluids", "Monitor temperature"],
                medicines: ["Paracetamol only if temperature increases."],
                food_advice: ["Soups", "Fruits", "Warm herbal tea"],
                follow_up_question: "Do you have any of these symptoms?",
                follow_up_options: ["Headache", "Body pain", "Cough", "Fatigue"],
                symptoms: ["mild fever"]
            };
        }
        if (msg.includes('100-102')) {
            return {
                reply: "Based on your temperature:",
                condition: "Moderate fever likely caused by viral infection.",
                care_advice: ["Rest", "Stay hydrated", "Use a cool compress"],
                medicines: ["Paracetamol (500mg)", "Ibuprofen if body pain is severe"],
                food_advice: ["Light meals", "Fruits", "Coconut water", "Vegetable soup"],
                doctor_visit: "Consult a doctor if fever lasts more than 3 days.",
                follow_up_question: "Do you have any of these symptoms?",
                follow_up_options: ["Headache", "Body pain", "Cough", "Fatigue"],
                symptoms: ["moderate fever"], suggested_medicines: ["paracetamol", "ibuprofen"]
            };
        }
        if (msg.includes('above 102')) {
            return {
                reply: "High fever detected.",
                condition: "High fever requiring attention.",
                care_advice: ["Take fever-reducing medicine", "Drink fluids", "Use cold compress"],
                medicines: ["Paracetamol", "Ibuprofen (if recommended)"],
                doctor_visit: "Seek medical attention immediately if fever remains above 102°F.",
                follow_up_question: "Do you have any of these symptoms?",
                follow_up_options: ["Headache", "Body pain", "Cough", "Fatigue"],
                symptoms: ["high fever"], suggested_medicines: ["paracetamol"]
            };
        }
        if (msg.includes('fever') && !msg.includes('100') && !msg.includes('102')) {
            return {
                reply: "I can help you manage your fever.",
                condition: "Viral or bacterial infection.",
                care_advice: ["Rest well", "Drink plenty of fluids", "Apply a cold compress"],
                medicines: ["Paracetamol", "Ibuprofen (if fever is high)"],
                doctor_visit: "If fever lasts more than 3 days.",
                follow_up_question: "What is your current temperature?",
                follow_up_options: ["Below 100°F", "100-102°F", "Above 102°F"],
                symptoms: ["fever"], suggested_medicines: ["paracetamol"]
            };
        }
        if (msg.includes('headache')) {
            return {
                reply: "Let's get that headache sorted out.",
                condition: "Dehydration, stress, or lack of sleep.",
                care_advice: ["Rest in a quiet, dark room.", "Drink a glass of water.", "Avoid screens for a while."],
                medicines: ["Paracetamol", "Ibuprofen"],
                doctor_visit: "If the headache is sudden and extremely severe.",
                symptoms: ["headache"], suggested_medicines: ["paracetamol"]
            };
        }
        if (msg.includes('period') || msg.includes('cramps')) {
            return {
                reply: "Period pain can be uncomfortable. Here is some advice.",
                condition: "Normal menstrual cycle contractions.",
                care_advice: ["Use a warm heating pad on your lower belly.", "Do gentle stretching or yoga.", "Stay hydrated."],
                medicines: ["Ibuprofen", "Specific period pain relievers"],
                doctor_visit: "If the pain is debilitating and disrupts your daily life.",
                symptoms: ["period pain"], suggested_medicines: ["ibuprofen"]
            };
        }
        if (msg.includes('cough') || msg.includes('cold')) {
            return {
                reply: "Based on your symptoms, here is some advice:",
                condition: "Common cold or mild viral infection.",
                care_advice: ["Rest well", "Drink warm fluids", "Use steam inhalation"],
                medicines: ["Paracetamol (for fever)", "Antihistamine (for cold)", "Cough syrup"],
                food_advice: ["Warm soups", "Honey with warm water", "Ginger tea"],
                doctor_visit: "Consult a doctor if symptoms last more than 5 days.",
                symptoms: ["cough", "cold"], suggested_medicines: ["paracetamol", "antihistamine", "cough syrup"]
            };
        }
        if (msg.includes('stomach pain') || msg.includes('vomiting')) {
            return {
                reply: "Based on your symptoms, here is some advice:",
                condition: "Food poisoning, indigestion, or gastric issue.",
                care_advice: ["Avoid heavy meals", "Rest your stomach", "Drink clear fluids slowly"],
                medicines: ["Antacid (for indigestion)", "ORS (Oral Rehydration Salts)"],
                food_advice: ["BRAT diet (Bananas, Rice, Applesauce, Toast)", "Coconut water", "Clear broths"],
                doctor_visit: "If vomiting lasts more than 24 hours or pain is severe.",
                symptoms: ["stomach pain", "vomiting"], suggested_medicines: ["ORS", "antacid"]
            };
        }
        if (msg.includes('dizziness')) {
            return {
                reply: "Based on your symptoms, here is some advice:",
                condition: "Dehydration, low blood pressure, or fatigue.",
                care_advice: ["Sit or lie down immediately.", "Drink water.", "Avoid sudden movements."],
                medicines: ["None required. Focus on hydration and rest."],
                food_advice: ["Water", "Fruit juice", "Light salty snacks"],
                doctor_visit: "If dizziness persists or you faint.",
                symptoms: ["dizziness"], suggested_medicines: []
            };
        }
        if (msg.includes('body pain')) {
            return {
                reply: "Based on your symptoms, here is some advice:",
                condition: "Physical exhaustion, stress, or viral infection.",
                care_advice: ["Get adequate rest", "Take a warm bath", "Gentle stretching"],
                medicines: ["Paracetamol", "Ibuprofen for pain relief"],
                food_advice: ["Warm milk", "Turmeric tea", "Protein-rich foods"],
                doctor_visit: "If pain is severe, persists for days, or occurs with high fever.",
                symptoms: ["body pain"], suggested_medicines: ["ibuprofen"]
            };
        }
        if (msg.includes('fatigue')) {
            return {
                reply: "Based on your symptoms, here is some advice:",
                condition: "Lack of sleep, overwork, stress, or minor illness.",
                care_advice: ["Ensure 7-8 hours of sleep.", "Take breaks during work.", "Stay hydrated."],
                medicines: ["None required. Multivitamins may help if deficient."],
                food_advice: ["Iron-rich foods", "Nuts and seeds", "Fresh fruits"],
                doctor_visit: "If fatigue persists for weeks despite resting.",
                symptoms: ["fatigue"], suggested_medicines: ["multivitamin"]
            };
        }
        if (msg.includes('dehydration')) {
            return {
                reply: "Based on your symptoms, here is some advice:",
                condition: "Inadequate fluid intake or fluid loss.",
                care_advice: ["Drink water slowly but steadily.", "Rest in a cool place.", "Avoid caffeinated drinks."],
                medicines: ["ORS (Oral Rehydration Salts)"],
                food_advice: ["Watermelon", "Cucumber", "Coconut water", "Clear soups"],
                doctor_visit: "If you feel faint, confused, or cannot keep fluids down.",
                symptoms: ["dehydration"], suggested_medicines: ["ORS"]
            };
        }

        return {
            reply: "Please describe your symptoms more specifically (like cough, body pain, headache) or ask a health-related question so I can assist you better."
        };
    }

    // 5. AI RESPONSE INTEGRATION
    async function getAIResponse(userMessage, languageCode) {
        const langMap = { 'en': 'English', 'hi': 'Hindi', 'te': 'Telugu' };
        const language = langMap[languageCode] || 'English';

        const systemPrompt = `You are Health Buddy, a professional interactive healthcare assistant.
        You ONLY answer health, medical, wellness, first-aid, and lifestyle questions.
        If unrelated, return { "reply": "I am Health Buddy, a healthcare assistant. Please ask health-related questions." }

        Provide safe, structured advice. If the user reports a symptom, ask relevant follow-up questions (e.g., temperature for fever, duration of pain).
        For First Aid (burns, broken bones, bleeding), give immediate, safe steps (e.g., cool water for burns, don't apply ice).
        For Health Education, provide daily tips.

        You MUST output your response strictly in JSON format exactly matching this structure (omit fields if not applicable):
        {
          "reply": "Conversational intro text in ${language}",
          "condition": "Possible condition",
          "care_advice": ["Care step 1", "Care step 2"],
          "medicines": ["Medicine 1", "Medicine 2"],
          "food_advice": ["Food recommendation 1", "Food recommendation 2"],
          "doctor_visit": "When to see a doctor warning",
          "follow_up_question": "A follow-up question for the user",
          "follow_up_options": ["Option 1", "Option 2", "Option 3"],
          "symptoms": ["list of symptoms detected, in English"],
          "suggested_medicines": ["list of medicines suggested, in English"]
        }`;

        let retries = 2;
        while (retries > 0) {
            try {
                if (API_KEY === "PASTE_API_KEY_HERE" || API_KEY === "YOUR_API_KEY") {
                    throw new Error("Invalid or missing API Key");
                }

                let apiMessages = [{ role: "system", content: systemPrompt }];
                // Add recent history to maintain session memory
                apiMessages = apiMessages.concat(conversationHistory.slice(-6));
                apiMessages.push({ role: "user", content: userMessage });

                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: apiMessages,
                        response_format: { type: "json_object" }
                    })
                });

                if (!response.ok) {
                    throw new Error(`API returned status ${response.status}`);
                }

                const data = await response.json();
                return JSON.parse(data.choices[0].message.content);
            } catch (error) {
                console.warn(`AI API Attempt Failed: ${error.message}. Retries left: ${retries - 1}`);
                retries--;
                if (retries === 0) {
                    console.log("Falling back to local rule-based response system.");
                    return getFallbackResponse(userMessage);
                }
                // Wait briefly before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    // 6. ADD MESSAGE TO UI
    function addMessage(data, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (sender === 'user') {
            messageDiv.innerHTML = `<p>${data}</p><span class="chat-timestamp">${time}</span>`;
            chatMessages.appendChild(messageDiv);
        } else {
            if (typeof data === 'string') {
                messageDiv.innerHTML = `<p>${data.replace(/\n/g, '<br>')}</p><span class="chat-timestamp">${time}</span>`;
            } else {
                let html = '';
                if(data.reply) html += `<p>${data.reply}</p>`;
                if(data.condition || data.cause) html += `<div class="info-card cause-card"><div class="card-header"><i class="fas fa-stethoscope"></i> Possible Condition</div><div class="card-body">${data.condition || data.cause}</div></div>`;
                if(data.care_advice && data.care_advice.length) html += `<div class="info-card care-card"><div class="card-header"><i class="fas fa-heartbeat"></i> Care Advice</div><div class="card-body"><ul>${data.care_advice.map(c=>`<li>${c}</li>`).join('')}</ul></div></div>`;
                if(data.medicines && data.medicines.length) html += `<div class="info-card med-card"><div class="card-header"><i class="fas fa-pills"></i> Suggested Medicine</div><div class="card-body"><ul>${data.medicines.map(m=>`<li>${m}</li>`).join('')}</ul></div></div>`;
                if(data.food_advice && data.food_advice.length) html += `<div class="info-card food-card"><div class="card-header"><i class="fas fa-apple-alt"></i> Food Recommendations</div><div class="card-body"><ul>${data.food_advice.map(f=>`<li>${f}</li>`).join('')}</ul></div></div>`;
                if(data.doctor_visit) html += `<div class="info-card warning-card"><div class="card-header"><i class="fas fa-exclamation-triangle"></i> Doctor Visit Warning</div><div class="card-body">${data.doctor_visit}</div></div>`;
                if(data.follow_up_question) html += `<p class="follow-up-q"><strong>${data.follow_up_question}</strong></p>`;
                
                messageDiv.innerHTML = html + `<span class="chat-timestamp">${time}</span>`;
                
                if(data.follow_up_options && data.follow_up_options.length) {
                    const optsContainer = document.createElement('div');
                    optsContainer.className = 'options-container';
                    data.follow_up_options.forEach(opt => {
                        const optBtn = document.createElement('button');
                        optBtn.className = 'option-btn';
                        optBtn.innerText = opt;
                        optBtn.onclick = () => {
                            chatInput.value = opt;
                            sendMessage();
                            optsContainer.style.pointerEvents = 'none';
                            optsContainer.style.opacity = '0.5';
                        };
                        optsContainer.appendChild(optBtn);
                    });
                    messageDiv.appendChild(optsContainer);
                }
            }
            chatMessages.appendChild(messageDiv);
            
            // Speak the conversational reply
            if (typeof data === 'string') speak(data);
            else if (data.reply) speak(data.reply);
        }
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 7. SEND MESSAGE
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        conversationHistory.push({ role: "user", content: text });
        addMessage(text, 'user');
        chatInput.value = '';

        const detectedSymptoms = detectSymptomsFromMessage(text);
        detectedSymptoms.forEach(sym => saveSymptom(sym));

        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span class="typing-text">HealthBuddy AI is typing...</span><div class="typing-dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const aiData = await getAIResponse(text, currentLanguage);
        conversationHistory.push({ role: "assistant", content: JSON.stringify(aiData) });
        
        typingIndicator.remove();
        
        // The whole object is passed to addMessage for card rendering
        addMessage(aiData, 'bot');
        
        if(aiData.symptoms && Array.isArray(aiData.symptoms)) {
            aiData.symptoms.forEach(sym => saveSymptom(sym));
        }
        
        let detectedMedicines = extractMedicines(aiData);
        detectedMedicines.forEach(m => saveMedicine(m));

        // Tracking medicines globally
        if(aiData.suggested_medicines && Array.isArray(aiData.suggested_medicines)) {
            aiData.suggested_medicines.forEach(med => {
                if (!detectedMedicines.includes(med.toLowerCase())) {
                    saveMedicine(med);
                }
            });
        }
    }

    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', sendMessage);
    }

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // 8. VOICE INTEGRATION
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        if (chatVoiceBtn) {
            chatVoiceBtn.addEventListener('click', () => {
                if (chatVoiceBtn.classList.contains('listening')) {
                    recognition.stop();
                    return;
                }

                if (currentLanguage === "en") {
                    recognition.lang = "en-IN";
                } else if (currentLanguage === "hi") {
                    recognition.lang = "hi-IN";
                } else if (currentLanguage === "te") {
                    recognition.lang = "te-IN";
                } else {
                    recognition.lang = "en-IN";
                }
                
                recognition.start();
            });
        }

        recognition.onstart = function() {
            chatVoiceBtn.classList.add('listening');
            chatInput.placeholder = translations[currentLanguage].listening;
        };

        recognition.onresult = function(event){
            let transcript = "";
            for(let i = event.resultIndex; i < event.results.length; i++){
                transcript += event.results[i][0].transcript;
            }
            document.getElementById("chatInput").value = transcript;
        };

        recognition.onerror = function(event){
            console.error("Voice recognition error:", event.error);
            alert("Microphone error or permission denied. Please allow microphone access.");
            chatVoiceBtn.classList.remove('listening');
            chatInput.placeholder = "Type your message...";
        };

        recognition.onend = function() {
            console.log("Voice recognition stopped");
            chatVoiceBtn.classList.remove('listening');
            chatInput.placeholder = "Type your message...";
        };
    } else {
        if (chatVoiceBtn) {
            chatVoiceBtn.addEventListener('click', () => {
                alert(translations[currentLanguage].voiceNotSupported);
            });
        }
    }

    // Speech Synthesis
    function speak(text) {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        
        const cleanText = text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '').replace(/[#*_]/g, '');
        const speech = new SpeechSynthesisUtterance(cleanText);
        speech.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'te' ? 'te-IN' : 'en-US';
        
        chatVoiceBtn.classList.add('speaking');
        speech.onend = () => {
            chatVoiceBtn.classList.remove('speaking');
        };
        speech.onerror = () => {
            chatVoiceBtn.classList.remove('speaking');
        };
        
        window.speechSynthesis.speak(speech);
    }
});