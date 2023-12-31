<script lang="ts">
    import DOMPurify from 'dompurify';
    import { onMount } from 'svelte';
    import { GamepadStandardAxis, GamepadStandardButton, addGamepadAxisInRangeNegativeListener, addGamepadAxisInRangePositiveListener, addGamepadButtonDownListener, removeGamepadButtonDownListener } from '../libs/GamepadHandler';
    import { addOnKeyDownListener, removeOnKeyDownListener } from '../libs/KeyboardHandler';
    import { removeKeyFromObject, uuidv4 } from '../libs/utils';
    import { AudioTypes, getAudioPlayer } from '../libs/AudioHandler';

    interface ModalButton {
        text: string;
        onClick?: () => void;
        closeAfterClick?: boolean;
    }

    interface Modal {
        title: string;
        content: string;
        buttons: ModalButton[];
        onOpen?: () => void;
        onClose?: () => void;
    }

    let modalElement: HTMLDialogElement;
    let modalsQueue: Record<string, Modal> = {};
    let currentButtonIndex = 0;
    $: modal = (() => {
        const modals = Object.values(modalsQueue);
        if (modals.length > 0) {
            modals[0].onOpen?.();
            return modals[0];
        }

        return undefined;
    })();

    $: {
        if (modalElement && !modalElement.open) {
            modalElement.showModal();
            modalElement.addEventListener('cancel', (e) => {
                e.preventDefault();
                closeCurrentModal();
            });
        }
    }

    onMount(() => {
        const highlightPreviousButton = addOnKeyDownListener('ArrowLeft', () => {
            if (modal) {
                currentButtonIndex = (currentButtonIndex - 1 + modal.buttons.length) % modal.buttons.length;
                getAudioPlayer(AudioTypes.Click)?.play();
            }
        });

        addGamepadButtonDownListener(GamepadStandardButton.DPadLeft, highlightPreviousButton);
        const stickHighlightPreviousButtonUnsubscriber = addGamepadAxisInRangeNegativeListener(GamepadStandardAxis.LeftStickX, highlightPreviousButton);

        const highlightNextButton = addOnKeyDownListener('ArrowRight', () => {
            if (modal) {
                currentButtonIndex = (currentButtonIndex + 1) % modal.buttons.length;
                getAudioPlayer(AudioTypes.Click)?.play();
            }
        });

        addGamepadButtonDownListener(GamepadStandardButton.DPadRight, highlightNextButton);
        const stickHighlightNextButtonUnsubscriber = addGamepadAxisInRangePositiveListener(GamepadStandardAxis.LeftStickX, highlightNextButton);

        const selectButton = addOnKeyDownListener('Enter', () => {
            if (modal) {
                modal.buttons[currentButtonIndex].onClick?.();
                modal.buttons[currentButtonIndex].closeAfterClick && closeCurrentModal();
                getAudioPlayer(AudioTypes.Click)?.play();
            }
        });

        addGamepadButtonDownListener(GamepadStandardButton.A, selectButton);

        return () => {
            removeOnKeyDownListener('ArrowLeft', highlightPreviousButton);
            removeOnKeyDownListener('ArrowRight', highlightNextButton);
            removeOnKeyDownListener('Enter', selectButton);
            removeGamepadButtonDownListener(GamepadStandardButton.DPadLeft, highlightPreviousButton);
            removeGamepadButtonDownListener(GamepadStandardButton.DPadLeft, highlightNextButton);
            stickHighlightPreviousButtonUnsubscriber();
            stickHighlightNextButtonUnsubscriber();
            removeGamepadButtonDownListener(GamepadStandardButton.A, selectButton);
        };
    });

    export function isModalOpen(id?: string) {
        return (id ? (modal === modalsQueue[id]) : true) && (modalElement?.open ?? false);
    }

    /**
     * Add a modal to the queue and returns its index
     * @param title Title of the modal, displayed as header
     * @param content Content of the modal. HTML is allowed
     * @param buttons Buttons of the modal
     * @param onOpen Function to call when the modal is opened
     * @param onClose Function to call when the modal is closed
     * @returns The index of the modal in the queue
     */
    export function showModal(title?: string, content?: string, buttons?: ModalButton[], onOpen?: () => void, onClose?: () => void): string {
        const id = uuidv4();
        title = title ?? '';
        content = content ?? '';
        buttons = buttons ?? [];

        modalsQueue = { ...modalsQueue, [id]: { title, content, buttons, onOpen, onClose } };

        return id;
    }

    export function closeModal(index: string) {
        modalsQueue = removeKeyFromObject(modalsQueue, index);
    }

    export function closeCurrentModal(): void {
        const modalID = Object.keys(modalsQueue).find((key) => modalsQueue[key] === modal);
        if (modalID) {
            modalsQueue[modalID].onClose?.();
            closeModal(modalID);
        }
    }
</script>

{#if modal}
    <dialog bind:this={modalElement}>
        <div class="innerDialog">
            <h2 class="title">{modal.title}</h2>
            <div class="content">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html DOMPurify.sanitize(modal.content)}
            </div>
            <div class="buttons">
                {#each modal.buttons as button, buttonIndex}
                    <button
                        class:active={buttonIndex === currentButtonIndex}
                        on:click={() => {
                            button.onClick?.();
                            button.closeAfterClick && closeCurrentModal();
                        }}
                        on:mousemove={() => (currentButtonIndex = buttonIndex)}
                    >
                        {button.text}
                    </button>
                {/each}
            </div>
        </div>
    </dialog>
{/if}

<style lang="scss">
    dialog {
        --background-color: black;
        --dialog-border-width: 0.1em;

        font-family: 'JetbrainsMono', Courier, monospace;
        width: 38em;
        text-align: center;
        background-color: var(--background-color);
        padding: calc(var(--dialog-border-width) * 6);

        box-shadow:
            calc(var(--dialog-border-width) * -2) 0 0 calc(var(--dialog-border-width) * -1) var(--background-color),    /* Left 1 */
            calc(var(--dialog-border-width) * -4) 0 0 calc(var(--dialog-border-width) * -2) var(--background-color),    /* Left 2 */
            calc(var(--dialog-border-width) * -6) 0 0 calc(var(--dialog-border-width) * -3) var(--background-color),    /* Left 3 */
            calc(var(--dialog-border-width) * -8) 0 0 calc(var(--dialog-border-width) * -4) var(--background-color),    /* Left 4 */
            calc(var(--dialog-border-width) * -10) 0 0 calc(var(--dialog-border-width) * -5) var(--background-color),   /* Left 5 */
            calc(var(--dialog-border-width) * -12) 0 0 calc(var(--dialog-border-width) * -6) var(--background-color),   /* Left 6 */
            calc(var(--dialog-border-width) * 2) 0 0 calc(var(--dialog-border-width) * -1) var(--background-color),     /* Right 1 */
            calc(var(--dialog-border-width) * 4) 0 0 calc(var(--dialog-border-width) * -2) var(--background-color),     /* Right 2 */
            calc(var(--dialog-border-width) * 6) 0 0 calc(var(--dialog-border-width) * -3) var(--background-color),     /* Right 3 */
            calc(var(--dialog-border-width) * 8) 0 0 calc(var(--dialog-border-width) * -4) var(--background-color),     /* Right 4 */
            calc(var(--dialog-border-width) * 10) 0 0 calc(var(--dialog-border-width) * -5) var(--background-color),    /* Right 5 */
            calc(var(--dialog-border-width) * 12) 0 0 calc(var(--dialog-border-width) * -6) var(--background-color);    /* Right 6 */

        @media (max-width: 38em) {
            width: 90vw;
        }

        &::backdrop {
            background-color: rgba(0, 0, 0, 0.5);
        }

        &:focus-visible {
            outline: none;
        }

        .innerDialog {
            --background-color: #bacb97;

            padding: 1em 0;
            background-color: var(--background-color);
            box-shadow:
                calc(var(--dialog-border-width) * -2) 0 0 calc(var(--dialog-border-width) * -1) var(--background-color),    /* Left 1 */
                calc(var(--dialog-border-width) * -4) 0 0 calc(var(--dialog-border-width) * -2) var(--background-color),    /* Left 2 */
                calc(var(--dialog-border-width) * -6) 0 0 calc(var(--dialog-border-width) * -3) var(--background-color),    /* Left 3 */
                calc(var(--dialog-border-width) * -8) 0 0 calc(var(--dialog-border-width) * -4) var(--background-color),    /* Left 4 */
                calc(var(--dialog-border-width) * 2) 0 0 calc(var(--dialog-border-width) * -1) var(--background-color),     /* Right 1 */
                calc(var(--dialog-border-width) * 4) 0 0 calc(var(--dialog-border-width) * -2) var(--background-color),     /* Right 2 */
                calc(var(--dialog-border-width) * 6) 0 0 calc(var(--dialog-border-width) * -3) var(--background-color),     /* Right 3 */
                calc(var(--dialog-border-width) * 8) 0 0 calc(var(--dialog-border-width) * -4) var(--background-color);     /* Right 4 */

            .title {
                margin-top: 0;
            }

            .buttons {
                display: flex;
                justify-content: space-evenly;
                margin-top: 1em;

                button {
                    font-family: inherit;
                    font-size: 1.3em;
                    background-color: transparent;
                    border: 0.2em solid rgba(0, 0, 0, 0);
                    text-transform: uppercase;
                    padding: 0.2em 0.4em;
                    cursor: pointer;

                    transition: border-color 0.2s linear;

                    &.active {
                        border-color: rgba(0, 0, 0, 0.3);
                        animation: infinite 0.5s linear 0.2s alternate pulse;
                    }

                    &:focus-visible {
                        outline: none;
                    }
                }

                @keyframes pulse {
                    from {
                        border-color: rgba(0, 0, 0, 0.3);
                    }
                    to {
                        border-color: rgba(0, 0, 0, 1);
                    }
                }
            }
        }
    }
</style>
