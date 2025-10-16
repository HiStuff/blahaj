export type Translator = {
    artificial: boolean
    id: string
    artificial_source: string | null
}

export interface Language {
    locale: string
    translator: Translator,
    localizations: {
        [K: string]: {
            name: string,
            description: string
        }
    },
    responses: {
        [K: string]: any
    },
    other: {
        [K: string]: any
    }
}

export interface Languages {
    [K: string]: Language
}

const idk = {
    "locale": "en-US",
    "translator": {
        "artificial": false,
        "id": "1393781155144269927",
        "artificial_source": null
    },
    "localizations": {
        "simpleembed": {
            "name": "simpleembed",
            "description": "Create simple embed."
        },
        "title": {
            "name": "title",
            "description": "Title"
        },
        "description": {
            "name": "description",
            "description": "Description"
        },
        "color": {
            "name": "color",
            "description": "Color"
        },
        "ping": {
            "name": "ping",
            "description": "Shows that the bot works!"
        },
        "warn": {
            "name": "warn",
            "description": "It... Warns!"
        },
        "user": {
            "name": "user",
            "description": "User to warn."
        },
        "reason": {
            "name": "reason",
            "description": "Reason."
        }
    },
    "responses": {
        "ping_response": {
            "title": "Latency",
            "description": "🏓 Latency is `~{0}ms`"
        },
        "ping_checking": "`🕑 Checking latency...`",
        "warn_warned_public": {
            "title": "Warn",
            "description": "{0} got warned by {1} for {2}."
        },
        "warn_warned": "`✅ Warned {0} for {1}. (Warn ID: {2})`"
    }
}