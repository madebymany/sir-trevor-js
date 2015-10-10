/**
 * Extended Text Block to support length limit
 */
SirTrevor.Blocks.TextLimited = SirTrevor.Blocks.Text.extend({

    type: "text_limited",

    text_limit: 300,
    too_long: false,

    onBlockRender: function() {
        var $limit_ui = $('<a class="st-block-ui-btn st-block-ui-text-limit"></a>');
        this.$ui.append($limit_ui);
        $limit_ui.html(this.text_limit);

        // Trigger change event for editable elements
        this.$editor.on('focus', function() {
            var $this = $(this);
            $this.data('before', $this.html());
            return $this;
        }).on('blur keyup paste input', function() {
            var $this = $(this);
            if ($this.data('before') !== $this.html()) {
                $this.data('before', $this.html());
                $this.trigger('change');
            }
            return $this;
        });

        this.$editor.change({block: this}, function (e) {
            var block = e.data.block,
                text_length = $(this).text().length;
            var dif = block.text_limit - text_length;
            
            if (dif < 0) {
                block.too_long = true;
            }
            else {
                block.too_long = false;
            }

            block.$el.toggleClass('st-block--with-errors', block.too_long);

            // Update UI with left symbols
            $limit_ui.html(dif);
        });
    },

    validations: ['limitTextLength'],

    limitTextLength: function() {
        if (this.too_long) {
            this.setError(this.$editor, i18n.t("errors:too_long"));
            return true;
        }
        return false;
    }
});