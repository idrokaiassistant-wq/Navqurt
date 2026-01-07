#!/bin/bash
# Barcha API route'larda `error: any` → `error: unknown` + error guard

for file in \
  src/app/api/admin/customers/route.ts \
  src/app/api/admin/orders/route.ts \
  src/app/api/admin/orders/[id]/route.ts \
  src/app/api/admin/products/route.ts \
  src/app/api/admin/products/[id]/route.ts \
  src/app/api/admin/warehouse/items/route.ts \
  src/app/api/admin/warehouse/items/[id]/route.ts \
  src/app/api/admin/warehouse/movements/route.ts
do
  if [ -f "$file" ]; then
    sed -i 's/error: any/error: unknown/g' "$file"
    sed -i 's/if (error\.message === "Unauthorized")/if (error instanceof Error \&\& error.message === "Unauthorized")/g' "$file"
    sed -i 's/error\.message || "/error instanceof Error ? error.message : "/g' "$file"
  fi
done



