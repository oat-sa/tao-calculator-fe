<script>
    // Licensed under Gnu Public License version 2
    // Copyright (c) 2023 (original work) Open Assessment Technologies SA ;

    function termProps(term) {
        const { type, value, label } = term;
        return { type, value, label };
    }

    export let type = '';
    export let value = '';
    export let label = '';
</script>

{#if Array.isArray(label)}
    <span data-value={value} data-type={type}>
        {#each label as term}<svelte:self {...termProps(term)} />{/each}
    </span>
{:else}
    <span data-value={value} data-type={type}>{@html label}</span>
{/if}

<style>
    [data-type='exponent'] {
        vertical-align: super;
        font-size: smaller;
    }

    [data-type='variable'] {
        font-weight: bold;
    }

    [data-type='function']:not([data-value*='rt']) {
        padding-right: 0.3em;
    }
</style>
