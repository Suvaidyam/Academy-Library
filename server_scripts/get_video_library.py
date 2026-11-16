# ---------------------------------------------------------------------------
# Frappe Server Script
#   Script Type : API
#   API Method  : get_video_library
#   Allow Guest : ✔ (checked)
#
# Endpoint : GET /api/method/get_video_library
#
# Query params (all optional):
#   page         int   1-based page number              (default 1)
#   page_length  int   items per page, 1..50            (default 12)
#   search       str   matches title / description / speaker / organisation / keywords / tags
#   category     str   exact match on video_category
#   language     str   exact match on language
#   sort         str   newest | oldest | title_asc | title_desc   (default newest)
#   name         str   fetch a single video by its name (ignores other filters)
#
# Response (frappe.response.message):
#   {
#     data: [...], total, page, page_length, total_pages,
#     has_next, has_prev,
#     filters: { categories: [...], languages: [...] }
#   }
# ---------------------------------------------------------------------------

DOCTYPE = "Video Library"
MAX_PAGE_LENGTH = 50
DEFAULT_PAGE_LENGTH = 12

FIELDS = [
    "name",
    "video_title",
    "short_description",
    "speaker_presenter",
    "designation",
    "organisation",
    "video_source",
    "url",
    "youtube_video_id",
    "youtube_url",
    "thumbnail",
    "video_category",
    "language",
    "duration",
    "publication_date",
    "keywords",
    "tags",
    "seo_title",
    "seo_description",
]

SORT_MAP = {
    "newest": "publication_date desc, creation desc",
    "oldest": "publication_date asc, creation asc",
    "title_asc": "video_title asc",
    "title_desc": "video_title desc",
}

args = frappe.form_dict

# ---------- single record ----------
single_name = (args.get("name") or "").strip()
if single_name:
    rows = frappe.get_all(DOCTYPE, filters={"name": single_name}, fields=FIELDS, limit_page_length=1)
    frappe.response["message"] = {"data": rows[0] if rows else None}
else:
    # ---------- pagination ----------
    page = frappe.utils.cint(args.get("page")) or 1
    if page < 1:
        page = 1

    page_length = frappe.utils.cint(args.get("page_length")) or DEFAULT_PAGE_LENGTH
    if page_length < 1:
        page_length = DEFAULT_PAGE_LENGTH
    if page_length > MAX_PAGE_LENGTH:
        page_length = MAX_PAGE_LENGTH

    # ---------- filters ----------
    filters = {}
    category = (args.get("category") or "").strip()
    language = (args.get("language") or "").strip()
    if category:
        filters["video_category"] = category
    if language:
        filters["language"] = language

    or_filters = None
    search = (args.get("search") or "").strip()[:100]
    if search:
        like = "%" + search + "%"
        or_filters = [
            [DOCTYPE, "video_title", "like", like],
            [DOCTYPE, "short_description", "like", like],
            [DOCTYPE, "speaker_presenter", "like", like],
            [DOCTYPE, "organisation", "like", like],
            [DOCTYPE, "keywords", "like", like],
            [DOCTYPE, "tags", "like", like],
        ]

    order_by = SORT_MAP.get((args.get("sort") or "newest").strip(), SORT_MAP["newest"])

    # ---------- total count (respects search + filters) ----------
    total = len(
        frappe.get_all(
            DOCTYPE,
            filters=filters,
            or_filters=or_filters,
            pluck="name",
            limit_page_length=0,
        )
    )

    total_pages = (total + page_length - 1) // page_length if total else 1
    if page > total_pages:
        page = total_pages

    data = frappe.get_all(
        DOCTYPE,
        filters=filters,
        or_filters=or_filters,
        fields=FIELDS,
        order_by=order_by,
        limit_start=(page - 1) * page_length,
        limit_page_length=page_length,
    )

    # ---------- filter options for dropdowns ----------
    categories = []
    for c in frappe.get_all(DOCTYPE, pluck="video_category", limit_page_length=0):
        if c and c not in categories:
            categories.append(c)
    categories.sort()

    languages = []
    for l in frappe.get_all(DOCTYPE, pluck="language", limit_page_length=0):
        if l and l not in languages:
            languages.append(l)
    languages.sort()

    frappe.response["message"] = {
        "data": data,
        "total": total,
        "page": page,
        "page_length": page_length,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
        "filters": {"categories": categories, "languages": languages},
    }
