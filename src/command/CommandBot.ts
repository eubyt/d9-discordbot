import {
    ColorResolvable,
    CommandInteraction,
    EmbedBuilder,
    LocalizationMap,
    User,
} from 'discord.js';
import { ConfigData } from '../model/Config';

export interface CommandName {
    name: string;
    locale: keyof LocalizationMap;
}

export interface CommandDescription {
    description: string;
    locale: keyof LocalizationMap;
}

export interface CommandBot {
    name: string;
    name_localizations?: LocalizationMap | null;

    description: string;
    description_localizations: LocalizationMap | null;

    options: unknown[];

    execute(
        intr: CommandInteraction,
        configData: ConfigData | undefined,
    ): Promise<void>;
}

export abstract class CommandCreator implements CommandBot {
    abstract name: string;
    abstract name_localizations: LocalizationMap | null;

    abstract options: unknown[];

    abstract description: string;
    abstract description_localizations: LocalizationMap | null;

    abstract execute(
        intr: CommandInteraction,
        configData: ConfigData | undefined,
    ): Promise<void>;

    public BasicEmbed(user: User, color: ColorResolvable) {
        return new EmbedBuilder()
            .setTimestamp()
            .setFooter({
                text: user.id,
                iconURL: user.avatarURL()?.toString(),
            })
            .setColor(color);
    }

    public getJSON() {
        let json: Record<string, unknown> = {
            name: this.name,
            type: 1,
            description: this.description,
            options: this.options,
        };

        if (this.name_localizations) {
            json = { name_localizations: this.name_localizations, ...json };
        }

        if (this.description_localizations) {
            json = {
                description_localizations: this.description_localizations,
                ...json,
            };
        }

        return json;
    }
}
