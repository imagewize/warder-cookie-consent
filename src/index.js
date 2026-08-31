import "vanilla-cookieconsent/dist/cookieconsent.css";
import * as CookieConsent from "vanilla-cookieconsent";

/**
 * Interface strings for the consent and preferences modals.
 *
 * Every language offered by warder_allowed_languages() in PHP must have an
 * entry here. The library throws "Could not load translation for the '<code>'
 * language" from run() if language.default names a key that is missing, and
 * because run() is async that rejection escapes a synchronous try/catch — the
 * banner then never renders at all. resolveLanguage() below guards against
 * that, but the real fix is to keep the two lists in step.
 *
 * The strings a site owner is most likely to change — both modal titles, the
 * description and the two banner buttons — are overwritten from the plugin
 * settings in createConfigFromSettings(). What is left here is the text the
 * settings screen does not expose.
 */
const uiTranslations = {
    en: {
        consentModal: {
            title: 'We use cookies',
            description: 'This website uses cookies to ensure its proper operation and to understand how you interact with it.',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Reject all',
            showPreferencesBtn: 'Manage preferences',
        },
        preferencesModal: {
            title: 'Manage cookie preferences',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Reject all',
            savePreferencesBtn: 'Accept current selection',
            closeIconLabel: 'Close modal',
            introTitle: 'Your Privacy Choices',
            introDescription: 'This panel allows you to customize your cookie preferences.',
        },
    },
    nl: {
        consentModal: {
            title: 'We gebruiken cookies',
            description: 'Deze website gebruikt cookies om goed te functioneren en om te begrijpen hoe u de site gebruikt.',
            acceptAllBtn: 'Alles accepteren',
            acceptNecessaryBtn: 'Alles weigeren',
            showPreferencesBtn: 'Voorkeuren beheren',
        },
        preferencesModal: {
            title: 'Cookievoorkeuren beheren',
            acceptAllBtn: 'Alles accepteren',
            acceptNecessaryBtn: 'Alles weigeren',
            savePreferencesBtn: 'Huidige selectie accepteren',
            closeIconLabel: 'Venster sluiten',
            introTitle: 'Uw privacykeuzes',
            introDescription: 'In dit venster kunt u uw cookievoorkeuren aanpassen.',
        },
    },
    de: {
        consentModal: {
            title: 'Wir verwenden Cookies',
            description: 'Diese Website verwendet Cookies, um ordnungsgemäß zu funktionieren und um zu verstehen, wie Sie mit ihr interagieren.',
            acceptAllBtn: 'Alle akzeptieren',
            acceptNecessaryBtn: 'Alle ablehnen',
            showPreferencesBtn: 'Einstellungen verwalten',
        },
        preferencesModal: {
            title: 'Cookie-Einstellungen verwalten',
            acceptAllBtn: 'Alle akzeptieren',
            acceptNecessaryBtn: 'Alle ablehnen',
            savePreferencesBtn: 'Aktuelle Auswahl akzeptieren',
            closeIconLabel: 'Fenster schließen',
            introTitle: 'Ihre Datenschutzeinstellungen',
            introDescription: 'In diesem Bereich können Sie Ihre Cookie-Einstellungen anpassen.',
        },
    },
    fr: {
        consentModal: {
            title: 'Nous utilisons des cookies',
            description: 'Ce site web utilise des cookies pour assurer son bon fonctionnement et pour comprendre comment vous interagissez avec lui.',
            acceptAllBtn: 'Tout accepter',
            acceptNecessaryBtn: 'Tout refuser',
            showPreferencesBtn: 'Gérer les préférences',
        },
        preferencesModal: {
            title: 'Gérer les préférences relatives aux cookies',
            acceptAllBtn: 'Tout accepter',
            acceptNecessaryBtn: 'Tout refuser',
            savePreferencesBtn: 'Accepter la sélection actuelle',
            closeIconLabel: 'Fermer la fenêtre',
            introTitle: 'Vos choix de confidentialité',
            introDescription: 'Ce panneau vous permet de personnaliser vos préférences en matière de cookies.',
        },
    },
    es: {
        consentModal: {
            title: 'Utilizamos cookies',
            description: 'Este sitio web utiliza cookies para garantizar su correcto funcionamiento y para entender cómo interactúas con él.',
            acceptAllBtn: 'Aceptar todo',
            acceptNecessaryBtn: 'Rechazar todo',
            showPreferencesBtn: 'Gestionar preferencias',
        },
        preferencesModal: {
            title: 'Gestionar preferencias de cookies',
            acceptAllBtn: 'Aceptar todo',
            acceptNecessaryBtn: 'Rechazar todo',
            savePreferencesBtn: 'Aceptar la selección actual',
            closeIconLabel: 'Cerrar ventana',
            introTitle: 'Tus opciones de privacidad',
            introDescription: 'Este panel te permite personalizar tus preferencias de cookies.',
        },
    },
    it: {
        consentModal: {
            title: 'Utilizziamo i cookie',
            description: 'Questo sito web utilizza i cookie per garantire il suo corretto funzionamento e per capire come interagisci con esso.',
            acceptAllBtn: 'Accetta tutto',
            acceptNecessaryBtn: 'Rifiuta tutto',
            showPreferencesBtn: 'Gestisci preferenze',
        },
        preferencesModal: {
            title: 'Gestisci le preferenze sui cookie',
            acceptAllBtn: 'Accetta tutto',
            acceptNecessaryBtn: 'Rifiuta tutto',
            savePreferencesBtn: 'Accetta la selezione attuale',
            closeIconLabel: 'Chiudi finestra',
            introTitle: 'Le tue scelte sulla privacy',
            introDescription: 'Questo pannello ti permette di personalizzare le tue preferenze sui cookie.',
        },
    },
};

const FALLBACK_LANGUAGE = 'en';

/**
 * Expands the flat uiTranslations entry for one language into the shape the
 * library expects, with the intro section as the first preferences section.
 * Category sections are appended later, from the plugin settings.
 */
function buildTranslation(code) {
    const strings = uiTranslations[code];

    return {
        consentModal: { ...strings.consentModal },
        preferencesModal: {
            title: strings.preferencesModal.title,
            acceptAllBtn: strings.preferencesModal.acceptAllBtn,
            acceptNecessaryBtn: strings.preferencesModal.acceptNecessaryBtn,
            savePreferencesBtn: strings.preferencesModal.savePreferencesBtn,
            closeIconLabel: strings.preferencesModal.closeIconLabel,
            sections: [
                {
                    title: strings.preferencesModal.introTitle,
                    description: strings.preferencesModal.introDescription,
                },
            ],
        },
    };
}

/**
 * Returns a language code that is guaranteed to have a translation, so the
 * library can never throw on a missing one.
 */
function resolveLanguage(requested) {
    return requested && Object.prototype.hasOwnProperty.call(uiTranslations, requested)
        ? requested
        : FALLBACK_LANGUAGE;
}

// Default configuration
const defaultConfig = {
    cookie: {
        name: 'cc_cookie',
        expiresAfterDays: 182,
    },

    guiOptions: {
        consentModal: {
            layout: 'cloud inline',
            position: 'bottom center',
            equalWeightButtons: true,
            flipButtons: false
        },
        preferencesModal: {
            layout: 'box',
            equalWeightButtons: true,
            flipButtons: false
        }
    },

    categories: {
        necessary: {
            enabled: true,
            readOnly: true
        },
        analytics: {
            enabled: false,
            readOnly: false,
            autoClear: {
                cookies: [
                    {
                        name: /^_ga/,
                    },
                    {
                        name: '_gid',
                    },
                    {
                        name: '_gat',
                    }
                ]
            }
        }
    },

    language: {
        default: FALLBACK_LANGUAGE,
        translations: Object.keys(uiTranslations).reduce((all, code) => {
            all[code] = buildTranslation(code);
            return all;
        }, {}),
    }
};

// Create configuration with WordPress settings
function createConfigFromSettings(defaultConfig, wpSettings) {
    // Start with a deep clone of the default config to avoid mutations
    const config = JSON.parse(JSON.stringify(defaultConfig));

    // Scope the consent cookie to the current site's own path. Matters on a
    // subdirectory multisite: every subsite shares one domain, so a path-less
    // ('/') cookie set on /site-a/ is also sent on /site-b/'s requests, and
    // vanilla-cookieconsent reads that as "this visitor already answered" —
    // one subsite's consent bleeds into every other. warder_cookie_path() in
    // PHP defaults to '/' on a normal single-site install, so this is a
    // no-op there.
    if (wpSettings && typeof wpSettings.cookie_path === 'string' && wpSettings.cookie_path !== '') {
        config.cookie.path = wpSettings.cookie_path;
    }

    if (!wpSettings || !wpSettings.settings) {
        return config;
    }

    const settings = wpSettings.settings;

    try {
        // Fall back to English if the stored language has no translation, so a
        // stale or unknown value cannot stop the banner from rendering.
        const langCode = resolveLanguage(settings.current_lang);
        config.language.default = langCode;

        const lang = config.language.translations[langCode];

        // Site-owner text overrides the built-in strings for this language.
        lang.consentModal.title = settings.title || lang.consentModal.title;
        lang.consentModal.description = settings.description || lang.consentModal.description;
        lang.consentModal.acceptAllBtn = settings.primary_btn_text || lang.consentModal.acceptAllBtn;
        lang.consentModal.acceptNecessaryBtn = settings.secondary_btn_text || lang.consentModal.acceptNecessaryBtn;

        // Keep the intro section, drop any category sections before rebuilding.
        lang.preferencesModal.sections = [lang.preferencesModal.sections[0]];

        // Set up categories (but don't completely overwrite the defaults)
        if (settings.cookie_categories && typeof settings.cookie_categories === 'object') {
            // Map WordPress categories to the config
            Object.entries(settings.cookie_categories).forEach(([categoryId, category]) => {
                // Create category if it doesn't exist, or update existing.
                // Necessary is always on and locked; all other categories are always
                // off by default and optional — users must actively opt in (GDPR).
                config.categories[categoryId] = config.categories[categoryId] || {};
                config.categories[categoryId].enabled = (categoryId === 'necessary');
                config.categories[categoryId].readOnly = (categoryId === 'necessary');

                // Set up cookie auto-clearing
                if (category.cookies && category.cookies.length > 0) {
                    config.categories[categoryId].autoClear = {
                        cookies: category.cookies.map(cookie => {
                            // Handle regex patterns for cookie names
                            if (cookie.is_regex && cookie.name.startsWith('/') && cookie.name.includes('/')) {
                                try {
                                    // Extract pattern from /pattern/
                                    const pattern = cookie.name.slice(1, cookie.name.lastIndexOf('/'));
                                    return { name: new RegExp(pattern) };
                                } catch (e) {
                                    console.error('Warder Cookie Consent: invalid regex pattern:', cookie.name);
                                    return { name: cookie.name };
                                }
                            } else {
                                return { name: cookie.name };
                            }
                        })
                    };
                }

                // Add section to preferences modal if it doesn't exist
                const existingSection = lang.preferencesModal.sections.find(
                    section => section.linkedCategory === categoryId
                );

                if (!existingSection) {
                    lang.preferencesModal.sections.push({
                        title: category.title || categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
                        description: category.description || '',
                        linkedCategory: categoryId
                    });
                } else {
                    // Update existing section
                    existingSection.title = category.title || existingSection.title;
                    existingSection.description = category.description || existingSection.description;
                }
            });
        }

        return config;
    } catch (error) {
        console.error('Warder Cookie Consent: error building configuration:', error);
        return defaultConfig; // Fall back to defaults on error
    }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get dynamic configuration from WordPress settings
    const config = typeof window.warderSettings !== 'undefined'
        ? createConfigFromSettings(defaultConfig, window.warderSettings)
        : defaultConfig;

    // run() is async: a rejection here would otherwise surface as an unhandled
    // promise rejection with no banner on the page and nothing in the log to
    // explain it.
    Promise.resolve(CookieConsent.run(config)).catch(function(error) {
        console.error('Warder Cookie Consent: failed to initialise:', error);
    });

    const prefButton = document.getElementById('warder-preferences-toggle');
    if (prefButton) {
        prefButton.addEventListener('click', function() {
            CookieConsent.showPreferences();
        });
    }
});
