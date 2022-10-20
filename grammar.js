module.exports = grammar({
  name: 'html',

  extras: $ => [
    /\s+/
  ],

  conflicts: ($, previous) => previous.concat([
    [$.self_closing_tag, $.end_tag]
  ]),

  externals: $ => [
    $._start_tag_name,
    $._script_start_tag_name,
    $._style_start_tag_name,
    $._end_tag_name,
    $.erroneous_end_tag_name,
    '/>',
    $._implicit_end_tag,
    $.raw_text,
    $.text,
  ],

  rules: {
    fragment: $ => repeat($._node),

    doctype: $ => seq(
      '<!',
      alias($._doctype, 'doctype'),
      /[^>]+/,
      '>'
    ),

    _doctype: $ => /[Dd][Oo][Cc][Tt][Yy][Pp][Ee]/,

    _node: $ => choice(
      $.doctype,
      $.text,
      $.element,
      $.comment,
      $.script_element,
      $.style_element,
      $.erroneous_end_tag
    ),

    comment: $ => seq(
      $.comment_start_tag,
      repeat($._node),
      $.comment_end_tag
    ),

    element: $ => choice(
      seq(
        $.start_tag,
        repeat($._node),
        choice($.end_tag, $._implicit_end_tag)
      ),
      $.self_closing_tag
    ),

    script_element: $ => seq(
      alias($.script_start_tag, $.start_tag),
      optional($.raw_text),
      $.end_tag
    ),

    style_element: $ => seq(
      alias($.style_start_tag, $.start_tag),
      optional($.raw_text),
      $.end_tag
    ),
  
    comment_start_tag: $ => '<!--',

    start_tag: $ => seq(
      '<',
      optional(alias($._start_tag_name, $.tag_name)),
      repeat($.attribute),
      '>'
    ),

    script_start_tag: $ => seq(
      '<',
      alias($._script_start_tag_name, $.tag_name),
      repeat($.attribute),
      '>'
    ),

    style_start_tag: $ => seq(
      '<',
      alias($._style_start_tag_name, $.tag_name),
      repeat($.attribute),
      '>'
    ),

    self_closing_tag: $ => choice(seq(
      '<',
      optional(alias($._start_tag_name, $.tag_name)),
      repeat($.attribute),
      '/>'
    ), 
    '</>'),

    comment_end_tag: $ => '-->',

    end_tag: $ => choice(seq(
      '</',
      optional(alias($._end_tag_name, $.tag_name)),
      '>'
    ), 
    '</>'),

    erroneous_end_tag: $ => seq(
      '</',
      $.erroneous_end_tag_name,
      '>'
    ),

    attribute: $ => seq(
      $.attribute_name,
      optional(seq(
        '=',
        choice(
          $.attribute_value,
          $.quoted_attribute_value
        )
      ))
    ),

    attribute_name: $ => /[^<>"'/=\s]+/,

    attribute_value: $ => /[^<>"'=\s]+/,

    quoted_attribute_value: $ => choice(
      seq("'", optional(alias(/[^']+/, $.attribute_value)), "'"),
      seq('"', optional(alias(/[^"]+/, $.attribute_value)), '"')
    ),

    // text: $ => /[^<>\s]([^<>]*[^<>\s])?/
  }
});
