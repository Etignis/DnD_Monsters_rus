# import re
import json
import typing
from copy import deepcopy

spell_template = "<i><a href='https://tentaculus.ru/spells/#q=phantasmal_force'>" \
                 "призрачный образ [phantasmal force]</a></i>"

with open('../data/monsters.js', encoding='utf-8') as input_file:
    first_part, js_file_text = input_file.read().split('var allMonsters = ')
    js_file_text = js_file_text[:-2]
    monsters_list = json.loads(js_file_text)  # type: typing.List[dict]
    changed_list = deepcopy(monsters_list)
    for number_in_list, monster in enumerate(monsters_list):
        traits = monster.get('trait')
        if not traits:
            continue
        if isinstance(traits, dict):  # only one trait
            traits = [traits, ]
        if not isinstance(traits, list):
            raise Exception(f'Traits for monster {monster["name"]} should be '
                            f'list here, {type(traits)} instead. Value: {traits}')
        for trait_number, trait in enumerate(traits):
            if 'заклинатель' in trait['name'].lower() or 'колдовство' in trait['name'].lower():
                for spell_string in trait["text"]:
                    if 'tentaculus' in spell_string:
                        continue
                    if 'заговор' in spell_string.lower() or \
                            'круг' in spell_string.lower()or \
                            'по желанию' in spell_string.lower() or \
                            'день' in spell_string.lower():
                        spells = spell_string.split(':')[1].split(',')
                        for original_spell in spells:
                            spell = original_spell.replace('(Ритуал)', '')
                            print(spell_string)
                            english_name = spell.split('(')[1][:-1]
                            link_word = '_'.join(english_name.lower().split())
                            linked_spell = f"<i> <a href='https://tentaculus.ru/" \
                                f"spells/#q={link_word}'>{spell.lower().replace('(', '[').replace(')', ']')}</a></i>"
                            print(f'{monster["name"]}: changing "{original_spell}" to "{linked_spell}"')
                            js_file_text = js_file_text.replace(original_spell, linked_spell)

    with open('../data/monsters_changed.js', 'w', encoding='utf-8') as output_file:
        output_file.write(first_part + 'var allMonsters = ' + js_file_text + ';\n')
