<script lang="ts">
    import { onMount } from 'svelte';
    import { GamepadStandardButton, addGamepadButtonDownListener, removeGamepadButtonDownListener } from '../libs/GamepadHandler';
    import { addOnKeyDownListener, removeOnKeyDownListener } from '../libs/KeyboardHandler';
    import { uuidv4 } from '../libs/utils';

    interface ModalButton {
        text: string;
        onClick?: () => void;
        closeAfterClick?: boolean;
    }

    interface Modal {
        title: string;
        content: string;
        buttons: ModalButton[];
    }

    let modalElement: HTMLDialogElement;
    let modalsQueue: Record<string, Modal> = {};
    let currentButtonIndex = 0;
    $: modal = (() => {
        const modals = Object.values(modalsQueue);
        return modals.length > 0 ? modals[0] : undefined;
    })();

    $: {
        if (modalElement && !modalElement.open) {
            modalElement.showModal();
            modalElement.addEventListener('close', closeCurrentModal);
        }
    }

    onMount(() => {
        const highlightPreviousButton = addOnKeyDownListener('ArrowLeft', () => {
            if (modal) {
                currentButtonIndex = (currentButtonIndex - 1 + modal.buttons.length) % modal.buttons.length;
            }
        });

        addGamepadButtonDownListener(GamepadStandardButton.DPadLeft, highlightPreviousButton);

        const highlightNextButton = addOnKeyDownListener('ArrowRight', () => {
            if (modal) {
                currentButtonIndex = (currentButtonIndex + 1) % modal.buttons.length;
            }
        });

        addGamepadButtonDownListener(GamepadStandardButton.DPadRight, highlightNextButton);

        const selectButton = addOnKeyDownListener('Enter', () => {
            if (modal) {
                modal.buttons[currentButtonIndex].onClick?.();
                modal.buttons[currentButtonIndex].closeAfterClick && closeCurrentModal();
            }
        });

        addGamepadButtonDownListener(GamepadStandardButton.A, selectButton);

        return () => {
            removeOnKeyDownListener('ArrowLeft', highlightPreviousButton);
            removeOnKeyDownListener('ArrowRight', highlightNextButton);
            removeOnKeyDownListener('Enter', selectButton);
            removeGamepadButtonDownListener(GamepadStandardButton.DPadLeft, highlightPreviousButton);
            removeGamepadButtonDownListener(GamepadStandardButton.DPadLeft, highlightNextButton);
            removeGamepadButtonDownListener(GamepadStandardButton.A, selectButton);
        };
    });

    export function isModalOpen(id?: string) {
        return (id ? (modal === modalsQueue[id]) : true) && (modalElement?.open ?? false);
    }

    /**
     * Add a modal to the queue and returns its index
     * @param _title Title of the modal
     * @param _content Content of the modal. HTML is allowed
     * @param _buttons Buttons of the modal
     * @returns The index of the modal in the queue
     */
    export function showModal(_title?: string, _content?: string, _buttons?: ModalButton[]): string {
        const id = uuidv4();
        const title = _title ?? '';
        const content = _content ?? '';
        const buttons = _buttons ?? [];

        modalsQueue = { ...modalsQueue, ...{ [id]: { title, content, buttons } } };

        return id;
    }

    export function closeModal(index: string) {
        const { [index]: modal, ...rest } = modalsQueue;
        modalsQueue = rest;
    }

    export function closeCurrentModal(): void {
        const modals = Object.keys(modalsQueue);
        if (modals.length > 0) {
            closeModal(modals[0]);
        }
    }
</script>

{#if modal}
    <dialog bind:this={modalElement}>
        <h2 class="title">{modal.title}</h2>
        <div class="content">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html modal.content}
        </div>
        <div class="buttons">
            {#each modal.buttons as button, buttonIndex}
                <button class:active={buttonIndex === currentButtonIndex} on:click={() => {
                    button.onClick?.();
                    button.closeAfterClick && closeCurrentModal();
                }}>{button.text}</button>
            {/each}
        </div>
    </dialog>
{/if}

<style lang="scss">
    dialog {
        --dialog-border-width: 0.2em;

        font-family: 'JetbrainsMono', Courier, monospace;
        width: 38em;
        text-align: center;
        background-color: #bacb97;

        border-top: calc(var(--dialog-border-width) * 5) solid black;
        border-bottom: calc(var(--dialog-border-width) * 5) solid black;
        box-shadow:
            calc(var(--dialog-border-width) * -2) 0 0 calc(var(--dialog-border-width) * -1) black,   /* Left 1 */
            calc(var(--dialog-border-width) * -4) 0 0 calc(var(--dialog-border-width) * -2) black, /* Left 2 */
            calc(var(--dialog-border-width) * -6) 0 0 calc(var(--dialog-border-width) * -3) black, /* Left 3 */
            calc(var(--dialog-border-width) * -8) 0 0 calc(var(--dialog-border-width) * -4) black, /* Left 4 */
            calc(var(--dialog-border-width) * 2) 0 0 calc(var(--dialog-border-width) * -1) black,   /* Right 1 */
            calc(var(--dialog-border-width) * 4) 0 0 calc(var(--dialog-border-width) * -2) black, /* Right 2 */
            calc(var(--dialog-border-width) * 6) 0 0 calc(var(--dialog-border-width) * -3) black, /* Right 3 */
            calc(var(--dialog-border-width) * 8) 0 0 calc(var(--dialog-border-width) * -4) black,; /* Right 4 */

        @media (max-width: 38em) {
            width: 90vw;
        }

        &::backdrop {
            background-color: rgba(0, 0, 0, 0.5);
        }

        &:focus-visible {
            outline: none;
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

                &:hover, &.active {
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
</style>
