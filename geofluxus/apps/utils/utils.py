def build_nested(tree_list):
    """
    create nested dict from list
    """
    if tree_list:
        return {tree_list[0]: build_nested(tree_list[1:])}
    return {}


def merge_nested(add, ref):
    """
    merge nested dicts
    add: dict to be added
    ref: original dict
    """
    res = {}
    for key in ref.keys():
        if type(add.get(key, None)) == dict:
            res[key] = merge_nested(add[key], ref[key])
        else:
            res[key] = add.get(key, ref[key])
    for key in add.keys():
        res[key] = res.get(key, add[key])
    return res


def flatten_nested(dic, keys, lvl=0, indent=False):
    """
    get all keys of nested dict
    """
    for key in dic.keys():
        formatted_val = lvl * '&emsp;' + key if indent else key
        keys.append(formatted_val)
        if isinstance(dic[key], dict):
            flatten_nested(dic[key], keys=keys, lvl=lvl+1, indent=indent)
    return keys


def get_material_hierarchy(iterable):
    hierarchy = {}  # level hierarchy

    for materials in iterable:
        # split materials
        materials = materials.split('&')

        # retrieve material levels
        for material in materials:
            levels = [lvl for lvl in material.split(',')]

            # convert into hierarchy
            tree = build_nested(levels)

            # merge with existent hierarchy
            hierarchy = merge_nested(tree, hierarchy)

    return hierarchy