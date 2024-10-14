WITH RECURSIVE descendants AS (
  SELECT id, type, "storePath"
  FROM "Block"
  WHERE id = $1

  UNION

  SELECT b.id, b.type, b."storePath"
  FROM "Block" b
  INNER JOIN descendants ON b."parentFolderId" = descendants.id
)

UPDATE "Block"
SET "deletionTime" = $2
WHERE id IN (SELECT id FROM descendants)

RETURNING (
  SELECT "storePath"
  FROM descendants
  WHERE type = 'FILE'
);
