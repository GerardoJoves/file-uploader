WITH RECURSIVE descendants AS (
  SELECT id, type
  FROM "Block"
  WHERE id = $1

  UNION

  SELECT b.id, b.type
  FROM "Block" b
  INNER JOIN descendants ON b."parentFolderId" = descendants.id
)

UPDATE "Block"
SET "deletionTime" = $2
WHERE id IN (SELECT id FROM descendants)
RETURNING id, type
