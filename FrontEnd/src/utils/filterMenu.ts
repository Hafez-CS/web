export const filterMenuByRole = (items: any[], allowed: string[]) => {
  return items
    .map((item) => {
      if (!item.children) {
        return allowed.includes(item.key) ? item : null;
      }

      const filteredChildren = item.children.filter((child: any) =>
        allowed.includes(child.key),
      );

      if (!filteredChildren.length) return null;

      return { ...item, children: filteredChildren };
    })
    .filter(Boolean);
};