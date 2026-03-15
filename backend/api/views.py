from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .scanner import scan_target


@csrf_exempt
def scan_api(request):

    if request.method == "POST":
        try:
            data = json.loads(request.body)

            target = data.get("target")

            result = scan_target([target])

            return JsonResponse(result, safe=False)

        except Exception as e:
            return JsonResponse({
                "error": str(e)
            }, status=500)

    return JsonResponse({"error": "POST required"})