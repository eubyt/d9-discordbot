import { CommandInteraction, GuildBasedChannel } from 'discord.js';
import { CommandCreator } from './CommandBot';
import { Logger } from '../model/Logger';
import { Config } from '../model';
import { ConfigData } from '../model/Config';
import { config } from 'process';

export class SetChannelCommand extends CommandCreator {
    public name = 'config-server-channel';
    public name_localizations = null;

    public description = '「Discord」 Configurar os canais do servidor';
    public description_localizations = null;

    public options = [
        {
            type: 3,
            name: 'tipo-canal',
            description: 'Escolha o canal para definir',
            required: true,
            choices: [
                {
                    name: 'Comandos',
                    value: 'comandos',
                },
                {
                    name: 'FMbot',
                    value: 'FMbot',
                },
                {
                    name: 'Channel Count',
                    value: 'ChannelCount',
                },
            ],
        },
        {
            type: 7,
            name: 'canal',
            description: 'Escolha o canal do servidor',
            required: true,
            channel_types: [0],
        },
    ];

    async execute(intr: CommandInteraction): Promise<void> {
        const userId = intr.user.id;
        void Logger.info(
            'SetChannelCommand',
            `Comando SetChannel foi iniciado pelo usuário ${intr.user.id}`,
        );

        await intr.deferReply({ ephemeral: true });

        const typeChannel = intr.options.get('tipo-canal', true)
            .value as string;
        const channel = intr.options.get('canal')?.channel as GuildBasedChannel;

        if (!(await this.validatePermissions(intr))) return;

        if (!intr.guildId) {
            await this.sendEmbed(
                intr,
                Config.getLang('commands.setchannel.error_messages.erro_title'),
                Config.getLang(
                    'commands.setchannel.error_messages.general_error',
                ),
                userId,
            );
            return;
        }

        const db = Config.getGuildCollection(intr.guildId);
        const doc = await db.get();
        const data = doc.data() as ConfigData;

        if (
            data.FmBotChannel === channel.id ||
            data.CommandChannel === channel.id ||
            data.CounterChannel === channel.id
        ) {
            await this.sendEmbed(
                intr,
                Config.getLang('commands.setchannel.error_messages.erro_title'),
                Config.getLang(
                    'commands.setchannel.error_messages.channel_already_exists',
                ),
                userId,
            );
            return;
        }

        switch (typeChannel) {
            case 'comandos':
                await db.update({
                    CommandChannel: channel.id,
                });
                break;
            case 'FMbot':
                await db.update({
                    FmBotChannel: channel.id,
                });
                break;
            case 'ChannelCount':
                await db.update({
                    CounterChannel: channel.id,
                });
                break;
            default:
                await this.sendEmbed(
                    intr,
                    Config.getLang(
                        'commands.setchannel.error_messages.erro_title',
                    ),
                    Config.getLang(
                        'commands.setchannel.error_messages.command_not_found',
                    ),
                    userId,
                );
                return;
        }

        Config.configCache.delete(intr.guildId);

        await this.sendEmbed(
            intr,
            Config.getLang('commands.setchannel.success_messages.sucess_title'),
            Config.getLang(
                'commands.setchannel.success_messages.channel_created',
            )
                .replace('{{channelName}}', channel.name)
                .replace('{{commandName}}', typeChannel),
            userId,
        );
    }

    private async validatePermissions(
        intr: CommandInteraction,
    ): Promise<boolean> {
        const member = await intr.guild?.members.fetch(intr.user.id);
        if (!member?.permissions.has('ManageChannels')) {
            await this.sendEmbed(
                intr,
                Config.getLang('commands.setchannel.error_messages.erro_title'),
                Config.getLang(
                    'commands.setchannel.error_messages.no_permission',
                ),
                intr.user.id,
            );
            return false;
        }
        return true;
    }
}
